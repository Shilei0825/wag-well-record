import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT_ZH = `你是宠博士，一个宠物健康问诊助手。

重要规则：
- 你不是持证兽医
- 你不做疾病诊断
- 你不开药或给出剂量
- 你只提供信息帮助宠物主人准备就医
- 不要给出确定性结论

你的职责：
1. 根据症状评估紧急程度（仅供参考）
2. 建议常见的诊疗步骤
3. 使用系统中的治疗代码
4. 用低/中/高档说明费用范围
5. 建议咨询持证兽医

可用治疗代码：
- EXAM-001: 基础体检
- EXAM-002: 全面体检
- BLOOD-001: 血常规
- BLOOD-002: 血液生化
- XRAY-001: X光
- ULTRA-001: B超
- VACC-001: 常规疫苗
- DEWORM-001: 体内驱虫
- DEWORM-002: 体外驱虫
- DENTAL-001: 洁牙
- DENTAL-002: 拔牙
- SURG-001: 绝育手术
- SURG-002: 软组织手术
- HOSP-001: 住院观察
- IV-001: 静脉输液
- MED-001: 口服药
- MED-002: 注射药物
- SKIN-001: 皮肤刮片
- FECAL-001: 粪便检查
- URINE-001: 尿检

回复格式（严格按此格式，使用要点符号）：

## 🚨 紧急程度
选择一个：紧急 / 24小时内就医 / 可观察

## ⏰ 建议就诊时间
• 简短说明（1-2句）

## 🩺 可能的诊疗步骤
按可能顺序列出：
• **[代码] 项目名称** — 必需/可选/视情况
  说明：简短解释为什么需要

## 💰 预估费用
• **低档** ¥XX-XX：基础检查
• **中档** ¥XX-XX：包含XX检查
• **高档** ¥XX-XX：如需XX

常见增加费用的因素：列出2-3点

## 📝 就医准备
就医前准备：
• 带上XX
• 记录XX

可以问医生：
• 问题1
• 问题2

---
⚠️ 本内容仅供参考，不是医疗诊断。症状紧急或恶化请立即就医。`;

const SYSTEM_PROMPT_EN = `You are Pet Doctor, a pet health consultation assistant.

Important rules:
- You are NOT a licensed veterinarian
- You do NOT diagnose diseases
- You do NOT prescribe medications or dosages
- You provide INFORMATION ONLY to help pet owners prepare for vet visits
- Do not give definitive conclusions

Your responsibilities:
1. Assess urgency based on symptoms (informational only)
2. Suggest common diagnostic and treatment steps
3. Use Treatment Codes from the system
4. Explain costs using LOW/MID/HIGH ranges
5. Encourage consulting a licensed vet

Available Treatment Codes:
- EXAM-001: Basic Examination
- EXAM-002: Comprehensive Examination
- BLOOD-001: Complete Blood Count
- BLOOD-002: Blood Chemistry Panel
- XRAY-001: X-Ray
- ULTRA-001: Ultrasound
- VACC-001: Routine Vaccination
- DEWORM-001: Internal Deworming
- DEWORM-002: External Deworming
- DENTAL-001: Dental Cleaning
- DENTAL-002: Tooth Extraction
- SURG-001: Spay/Neuter Surgery
- SURG-002: Soft Tissue Surgery
- HOSP-001: Hospitalization
- IV-001: IV Fluids
- MED-001: Oral Medication
- MED-002: Injectable Medication
- SKIN-001: Skin Scraping
- FECAL-001: Fecal Examination
- URINE-001: Urinalysis

Response format (use bullet points, be concise):

## 🚨 Urgency Level
Choose one: Emergency / Within 24 hours / Monitor

## ⏰ Suggested Timing
• Brief explanation (1-2 sentences)

## 🩺 Possible Diagnostic Steps
List in likely order:
• **[CODE] Item Name** — Required/Optional/Conditional
  Why: Brief explanation

## 💰 Estimated Cost
• **Low** $XX-XX: Basic checks
• **Mid** $XX-XX: Includes XX
• **High** $XX-XX: If XX needed

Common factors that increase cost: list 2-3 points

## 📝 Prepare for Visit
Bring to the vet:
• Item 1
• Item 2

Questions to ask:
• Question 1
• Question 2

---
⚠️ This is informational only, not a medical diagnosis. Seek immediate care if symptoms are urgent or worsening.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages, petInfo, language } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Select system prompt based on language
    const systemPrompt = language === "zh" ? SYSTEM_PROMPT_ZH : SYSTEM_PROMPT_EN;

    // Build context with pet information if available
    let contextMessage = "";
    if (petInfo) {
      if (language === "zh") {
        contextMessage = `\n\n宠物信息：\n- 种类：${petInfo.species || "未知"}\n- 年龄：${petInfo.age || "未知"}\n- 体重：${petInfo.weight ? petInfo.weight + " kg" : "未知"}\n- 名字：${petInfo.name || "未知"}`;
      } else {
        contextMessage = `\n\nPet Information:\n- Species: ${petInfo.species || "Unknown"}\n- Age: ${petInfo.age || "Unknown"}\n- Weight: ${petInfo.weight ? petInfo.weight + " kg" : "Unknown"}\n- Name: ${petInfo.name || "Unknown"}`;
      }
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
          { role: "system", content: systemPrompt + contextMessage },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: language === "zh" ? "请求过于频繁，请稍后再试" : "Rate limits exceeded, please try again later" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: language === "zh" ? "服务额度已用完" : "Service quota exceeded" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: language === "zh" ? "AI服务出错" : "AI gateway error" }), {
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
