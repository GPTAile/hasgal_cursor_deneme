# hasgal cursor denemesi

## Netlify'da API Anahtarı Güvenliği

- **Gemini API anahtarınızı asla kodda veya `netlify.toml` dosyasında tutmayın!**
- Anahtarınızı sadece Netlify panelinden ekleyin:
  1. Netlify panelinde sitenize girin.
  2. "Site settings > Environment variables" bölümüne gidin.
  3. `GEMINI_API_KEY` isminde bir environment variable oluşturun ve anahtarınızı buraya yazın.
- Kodunuzda ve sunucu fonksiyonlarınızda `process.env.GEMINI_API_KEY` ile kullanmaya devam edin.
- `.env.example` dosyası sadece örnek içindir, anahtarınızı buraya yazmayın.

**Bu yöntemle anahtarınız asla GitHub'a veya başka bir yere açık şekilde gitmez!**