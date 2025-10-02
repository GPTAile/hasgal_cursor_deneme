import { Handler } from '@netlify/functions'

const handler: Handler = async (event) => {
  const { prompt } = JSON.parse(event.body || '{}')

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    })
  })

  const data = await response.json()

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  }
}

export { handler }
