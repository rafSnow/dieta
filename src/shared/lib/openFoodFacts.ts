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

  const url = `https://br.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'NutriFlowApp - Android/Web - WebApp'
      }
    });

    if (!response.ok) {
      throw new Error('Falha ao consultar a API Open Food Facts');
    }

    const data = await response.json();
    
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
