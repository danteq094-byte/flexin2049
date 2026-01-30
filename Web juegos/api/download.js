export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: "No ID provided" });
    }

    try {
        // 1. Intentar obtener el nombre del juego para que el archivo se vea profesional
        const infoRes = await fetch(`https://games.roproxy.com/v1/games/multiget-place-details?placeIds=${id}`);
        const infoData = await infoRes.json();
        const gameName = infoData[0]?.name ? infoData[0].name.replace(/[^a-z0-9]/gi, '_') : "FlexinGame";

        // 2. Descargar el archivo desde el servidor de assets de Roblox
        const assetUrl = `https://assetdelivery.roproxy.com/v1/asset/?id=${id}`;
        const response = await fetch(assetUrl, {
            headers: { 'User-Agent': 'Roblox/WinInet' }
        });

        if (!response.ok) throw new Error("Game is private or ID is invalid");

        const buffer = await response.arrayBuffer();

        // 3. Forzar la descarga con el nombre del juego y extensión .rbxm
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${gameName}.rbxm"`);
        
        return res.send(Buffer.from(buffer));

    } catch (error) {
        return res.status(500).json({ error: "Download failed", details: error.message });
    }
}