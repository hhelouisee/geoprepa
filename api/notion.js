module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  
  const pageId = process.env.NOTION_PAGE;
  const key = process.env.NOTION_KEY;
  
  if (!pageId || !key) return res.status(500).json({error: 'Missing env vars'});
  
  try {
    const response = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
      headers: {
        'Authorization': `Bearer ${key}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch(e) {
    res.status(500).json({error: e.message});
  }
}
