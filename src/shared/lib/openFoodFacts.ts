export interface OFFProduct {
  id: string;
  product_name: string;
  brands?: string;
  image_url?: string;
  nutriments: {
    'energy-kcal_100g'?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
  };
}

export async function searchOpenFoodFacts(query: string): Promise<OFFProduct[]> {
  if (!query || query.trim().length < 2) return [];

  const targetUrl = `https://br.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20`;
  const url = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Falha na comunicação com o proxy.');
    }

    const proxyData = await response.json();
    
    // allorigins returns status.http_code
    if (proxyData.status && proxyData.status.http_code === 503) {
      throw new Error('O servidor do Open Food Facts está sobrecarregado no momento (Erro 503). Tente novamente mais tarde.');
    }

    if (!proxyData.contents) {
      throw new Error('Resposta vazia da API.');
    }

    const data = JSON.parse(proxyData.contents);
    
    // Filtrar apenas produtos que tenham macronutrientes declarados e tenham nome
    const validProducts = (data.products || []).filter((p: any) => {
      if (!p.product_name) return false;
      const n = p.nutriments;
      if (!n) return false;
      return (
        typeof n['energy-kcal_100g'] === 'number' || 
        typeof n.proteins_100g === 'number' ||
        typeof n.carbohydrates_100g === 'number' ||
        typeof n.fat_100g === 'number'
      );
    });

    return validProducts;
  } catch (error) {
    console.error('Erro na busca do Open Food Facts:', error);
    throw error;
  }
}
