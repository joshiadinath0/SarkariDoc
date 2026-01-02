try {
    const canvas = require('canvas');
    console.log('Canvas loaded successfully');
    console.log('Backend:', canvas.backends);
} catch (e) {
    console.error('Failed to load canvas:', e.message);
    // console.error(e);
}
