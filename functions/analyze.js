export async function onRequestPost(context) {
    // Cloudflare 설정에서 등록할 API 키를 가져옵니다.
    const API_KEY = context.env.GEMMA_API_KEY; 
  
    try {
      const data = await context.request.json();
      const resumeText = data.text;
  
      // Gemma 4 26B 모델 호출 주소
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent?key=${API_KEY}`;
  
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ 
              text: `당신은 필리핀 구인구직 전문가입니다. 아래 이력서를 분석하여 필리핀 페소(PHP) 기준 예상 연봉과 커리어 조언을 요약해 주세요: ${resumeText}` 
            }]
          }]
        })
      });
  
      const result = await response.json();
      
      return new Response(JSON.stringify({
        message: result.candidates[0].content.parts[0].text
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
  
    } catch (error) {
      return new Response(JSON.stringify({ error: "Gemma 4 분석 중 오류가 발생했습니다." }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }