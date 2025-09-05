import supabase from '../config/supabaseClient.js';

export const getAdverts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('adverts')
      .select(`
        id,
        title,
        description,
        created_at,
        advert_images (
          id,
          image_path,
          uploaded_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createAdvert = async (req, res) => {
  try {
    const { title, description, image_urls } = req.body;

    if (!title || !description || !image_urls || !Array.isArray(image_urls)) {
      return res.status(400).json({ error: 'Missing or invalid required fields' });
    }

    // Insert advert
    const { data: advertData, error: advertError } = await supabase
      .from('adverts')
      .insert([{ title, description }])
      .select()
      .single();

    if (advertError) {
      return res.status(400).json({ error: advertError.message });
    }

    const advertId = advertData.id;

    // Insert images
    const imagesToInsert = image_urls.map(url => ({
      advert_id: advertId,
      image_path: url
    }));

    const { error: imageError } = await supabase
      .from('advert_images')
      .insert(imagesToInsert);

    if (imageError) {
      return res.status(400).json({ error: imageError.message });
    }

    res.status(201).json({ message: 'Advert created successfully', advert: advertData });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAdvertsByCategory  = async (req, res) => {
  try {
    const { category } = req.params;

    const { data, error } = await supabase
      .from('adverts')
      .select('*')
      .eq('page_category', category);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

