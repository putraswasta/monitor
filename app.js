const PACK_TIMEOUT = 10000; // 10 detik

function removeStalePacks() {
    const now = Date.now();

    Object.keys(packs).forEach(packId => {
        if (
            !packs[packId].lastSeen ||
            now - packs[packId].lastSeen > PACK_TIMEOUT
        ) {
            delete packs[packId];
        }
    });

    render();
}

setInterval(removeStalePacks, 1000);
