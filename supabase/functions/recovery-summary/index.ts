import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CheckinData {
  day_index: number;
  appetite: string;
  energy: string;
  symptom_status: string;
}

interface RequestBody {
  petName: string;
  mainSymptom: string;
  checkins: CheckinData[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { petName, mainSymptom, checkins } = await req.json() as RequestBody;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build a summary of the checkin data
    const checkinSummary = checkins.map((c) => 
      `第${c.day_index}天: 食欲=${translateAppetite(c.appetite)}, 精力=${translateEnergy(c.energy)}, 症状=${translateSymptom(c.symptom_status)}`
    ).join('\n');

    const systemPrompt = `你是一位温和、专业的宠物健康观察助手。你的任务是根据主人记录的恢复观察数据，提供一个简短的恢复状态总结。

重要规则：
- 不要给出医学诊断
- 不要建议具体药物
- 保持语言温和、支持性
- 如果趋势不好，建议考虑就医检查
- 总结要简洁，2-3句话即可`;

    const userPrompt = `宠物名字：${petName}
观察的主要症状：${mainSymptom}

恢复观察记录：
${checkinSummary}

请根据以上记录，用JSON格式回复：
{
  "trend": "improving" | "stable" | "worsening",
  "summary": "中文总结，2-3句话",
  "suggestion": "建议（继续观察/考虑就医）"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_recovery_summary",
              description: "Provide a structured recovery summary",
              parameters: {
                type: "object",
                properties: {
                  trend: { 
                    type: "string", 
                    enum: ["improving", "stable", "worsening"],
                    description: "The overall recovery trend"
                  },
                  summary: { 
                    type: "string",
                    description: "A 2-3 sentence summary in Chinese"
                  },
                  suggestion: { 
                    type: "string",
                    description: "Suggestion in Chinese (continue observing or consider vet visit)"
                  }
                },
                required: ["trend", "summary", "suggestion"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "provide_recovery_summary" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "请求过于频繁，请稍后再试" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "服务额度不足" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI服务暂时不可用" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback if tool call didn't work
    return new Response(JSON.stringify({
      trend: "stable",
      summary: "观察记录已收集完成。建议继续关注宠物状态。",
      suggestion: "如有异常，请及时就医"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("recovery-summary error:", e);
    return new Response(JSON.stringify({ 
      error: e instanceof Error ? e.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function translateAppetite(appetite: string): string {
  const map: Record<string, string> = {
    normal: "正常",
    reduced: "减少",
    poor: "很差"
  };
  return map[appetite] || appetite;
}

function translateEnergy(energy: string): string {
  const map: Record<string, string> = {
    normal: "正常",
    low: "较低",
    very_low: "很低"
  };
  return map[energy] || energy;
}

function translateSymptom(symptom: string): string {
  const map: Record<string, string> = {
    improved: "好转",
    same: "持平",
    worse: "加重"
  };
  return map[symptom] || symptom;
}
