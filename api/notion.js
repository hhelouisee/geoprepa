module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const key = process.env.NOTION_KEY;
  const rootId = process.env.NOTION_PAGE;
  
  const h = {'Authorization': `Bearer ${key}`, 'Notion-Version': '2022-06-28'};
  
  try {
    // Tester d'abord si on peut lire la page elle-même
    const pageR = await fetch(`https://api.notion.com/v1/pages/${rootId}`, {headers: h});
    const pageD = await pageR.json();
    
    const blocksR = await fetch(`https://api.notion.com/v1/blocks/${rootId}/children`, {headers: h});
    const blocksD = await blocksR.json();
    
    res.status(200).json({page: pageD, blocks: blocksD});
  } catch(e) {
    res.status(500).json({error: e.message});
  }
}
