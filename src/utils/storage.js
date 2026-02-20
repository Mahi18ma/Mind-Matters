export const storage = {
    get: (key, defaultValue) => {
        try {
            const val = localStorage.getItem(key);
            return val ? JSON.parse(val) : defaultValue;
        } catch {
            return defaultValue;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch { /* ignore */ }
    },
    remove: (key) => {
        try { localStorage.removeItem(key); } catch { /* ignore */ }
    },
};

export const userKey = (user, suffix) => `mom_${user}_${suffix}`;
