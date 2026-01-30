export default async function handler(req, res) {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "No ID" });

    try {
        // Intentamos sacar el nombre del juego
        const infoRes = await fetch(`https://games.roproxy.com/v1/games/multiget-place-details?placeIds=${id}`);
        const infoData = await infoRes.json();
        const gameName = infoData[0]?.name ? infoData[0].name.replace(/[^a-z0-9]/gi, '_') : `Game_${id}`;

        // Descarga directa usando un User-Agent de Roblox para que no nos bloqueen
        const assetUrl = `https://assetdelivery.roproxy.com/v1/asset/?id=${id}`;
        const response = await fetch(assetUrl, {
            headers: { 'User-Agent': 'Roblox/WinInet' }
        });

        if (!response.ok) throw new Error("Blocked or Private");

        const buffer = await response.arrayBuffer();

        // Enviamos el archivo
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${gameName}.rbxm"`);
        return res.send(Buffer.from(buffer));

    } catch (error) {
        // Si falla el proxy, intentamos un último método antes de rendirnos
        return res.redirect(`https://assetdelivery.roblox.com/v1/asset/?id=${id}`);
    }
}
