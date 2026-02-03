import "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ScanRequest {
  imageBase64: string;
  documentType: 'expense' | 'visit' | 'health_record';
  language: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, documentType, language } = await req.json() as ScanRequest;

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Build the extraction prompt based on document type
    let extractionPrompt = "";
    
    if (documentType === 'expense') {
      extractionPrompt = `Analyze this receipt/bill image and extract the following information in JSON format:
{
  "category": "medical" | "food" | "supplies" | "other",
  "date": "YYYY-MM-DD format or null",
  "amount": number or null,
  "merchant": "store/merchant name or null",
  "notes": "any relevant details or null"
}

Rules:
- category: "medical" for vet/pharmacy, "food" for pet food/treats, "supplies" for toys/accessories, "other" for anything else
- date: Extract the transaction date in YYYY-MM-DD format
- amount: Extract the total amount as a number (remove currency symbols)
- merchant: The store or business name
- notes: Any product names or relevant details

Return ONLY the JSON object, no markdown or explanation.`;
    } else if (documentType === 'visit') {
      extractionPrompt = `Analyze this veterinary document/bill image and extract the following information in JSON format:
{
  "visitDate": "YYYY-MM-DD format or null",
  "clinicName": "clinic/hospital name or null",
  "reason": "reason for visit or null",
  "diagnosis": "diagnosis or null",
  "treatment": "treatment details or null",
  "totalCost": number or null,
  "notes": "any other relevant details or null"
}

Rules:
- Extract dates in YYYY-MM-DD format
- totalCost should be a number (remove currency symbols)
- Include medication names in treatment if present

Return ONLY the JSON object, no markdown or explanation.`;
    } else if (documentType === 'health_record') {
      extractionPrompt = `Analyze this health record/vaccine card/medication image and extract the following information in JSON format:
{
  "type": "vaccine" | "deworming" | "medication",
  "name": "name of vaccine/medication or null",
  "date": "YYYY-MM-DD format or null",
  "nextDueDate": "YYYY-MM-DD format or null",
  "notes": "batch number, dosage, or other details or null"
}

Rules:
- type: "vaccine" for vaccines/immunizations, "deworming" for antiparasitic treatments, "medication" for other medications
- name: The specific vaccine or medication name
- date: The date administered/given
- nextDueDate: Next scheduled dose if mentioned
- notes: Include batch/lot numbers, dosage, manufacturer if visible

Return ONLY the JSON object, no markdown or explanation.`;
    }

    // Add language instruction
    const langNote = language === 'zh' 
      ? "\n\nThe document may be in Chinese. Extract information accordingly but return field names in English."
      : "";

    // Call Lovable AI API with vision capability
    const response = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: extractionPrompt + langNote,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI API error:", errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    let extractedData;
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      extractedData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse extracted data");
    }

    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Scan document error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to scan document" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
