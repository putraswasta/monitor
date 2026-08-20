const PACK_TIMEOUT = 10000; // 10 detik

const packs = {};

function updatePack(packId, data) {
    packs[packId] = {
        ...data,
        lastSeen: Date.now()
    };

    renderPacks();
}

function removeOfflinePacks() {
    const now = Date.now();
    let changed = false;

    Object.keys(packs).forEach(packId => {
        if (now - packs[packId].lastSeen > PACK_TIMEOUT) {
            delete packs[packId];
            changed = true;
            console.log(`[OFFLINE] ${packId} dihapus dari dashboard`);
        }
    });

    if (changed) {
        renderPacks();
    }
}

setInterval(removeOfflinePacks, 1000);
