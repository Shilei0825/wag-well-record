import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are 宠博士 (Pet Doctor), an AI veterinary triage and care-preparation assistant.

IMPORTANT RULES (must follow strictly):
- You are NOT a licensed veterinarian.
- You do NOT diagnose diseases.
- You do NOT prescribe medications or dosages.
- You provide INFORMATION ONLY to help pet owners prepare for a veterinary visit.
- You must NOT claim certainty or final conclusions.

Your responsibilities:
1. Assess urgency based on symptoms (informational only).
2. Suggest common veterinary diagnostic and treatment steps.
3. ALWAYS express steps using existing Treatment Codes from the system.
4. Explain costs using LOW / MID / HIGH ranges only.
5. Encourage consultation with a licensed veterinarian.

You must NEVER:
- Name a specific disease as a confirmed diagnosis.
- Give medical instructions or drug dosing.
- Invent Treatment Codes.
- Use treatment names that are not in the system.

If suitable Treatment Codes are not available, say:
"No standard treatment code available yet." / "暂无对应的标准治疗代码。"

Available Treatment Codes:
- EXAM-001: 基础体检 (Basic Examination)
- EXAM-002: 全面体检 (Comprehensive Examination)
- BLOOD-001: 血常规检查 (Complete Blood Count)
- BLOOD-002: 血液生化检查 (Blood Chemistry Panel)
- XRAY-001: X光检查 (X-Ray)
- ULTRA-001: B超检查 (Ultrasound)
- VACC-001: 常规疫苗接种 (Routine Vaccination)
- DEWORM-001: 体内驱虫 (Internal Deworming)
- DEWORM-002: 体外驱虫 (External Deworming)
- DENTAL-001: 牙齿清洁 (Dental Cleaning)
- DENTAL-002: 拔牙手术 (Tooth Extraction)
- SURG-001: 绝育手术 (Spay/Neuter Surgery)
- SURG-002: 软组织手术 (Soft Tissue Surgery)
- HOSP-001: 住院观察 (Hospitalization)
- IV-001: 静脉输液 (IV Fluids)
- MED-001: 口服药物治疗 (Oral Medication)
- MED-002: 注射药物治疗 (Injectable Medication)
- SKIN-001: 皮肤刮片检查 (Skin Scraping)
- FECAL-001: 粪便检查 (Fecal Examination)
- URINE-001: 尿液检查 (Urinalysis)

OUTPUT FORMAT (follow exactly, respond in the user's language):

**紧急程度 / Urgency Level:**
(Choose ONE only: 紧急/Emergency / 24小时内/Within 24 hours / 观察/Monitor)

**建议就诊时间 / Suggested Timing:**
(1–2 short sentences)

**常见诊疗路径 / Common Diagnostic and Treatment Path:**
For each item include:
- Treatment Code
- Treatment name
- Necessity: 必需/required | 可选/optional | 视情况/conditional
- Plain-language explanation

**预估费用范围 / Estimated Cost Range:**
- 低档 / Low range: ¥XX - ¥XX (explanation)
- 中档 / Mid range: ¥XX - ¥XX (explanation)  
- 高档 / High range: ¥XX - ¥XX (explanation)
- Note what usually increases cost

**给宠物主人的建议 / Notes for Pet Owner:**
- Questions to ask the veterinarian
- Information to prepare before the visit

**免责声明 / Disclaimer:**
本内容仅供参考，不构成医疗诊断。如症状紧急或恶化，请立即前往有执照的兽医处就诊。
This content is for informational purposes only and is not a medical diagnosis. For urgent or worsening symptoms, please seek care from a licensed veterinarian immediately.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, petInfo } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context with pet information if available
    let contextMessage = "";
    if (petInfo) {
      contextMessage = `\n\nPet Information:\n- Species: ${petInfo.species || "Unknown"}\n- Age: ${petInfo.age || "Unknown"}\n- Weight: ${petInfo.weight ? petInfo.weight + " kg" : "Unknown"}\n- Name: ${petInfo.name || "Unknown"}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + contextMessage },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "请求过于频繁，请稍后再试。/ Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "服务额度已用完，请联系管理员。/ Payment required, please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI服务出错 / AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-vet error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
