const API_URL = 'http://localhost:5000/api/auth';

export const authService = {
    
    async register(username: string, email: string, password: string) {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });
        return response.json();
    },

    
    async login(email: string, password: string) {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        return response.json();
    },

    
    async getMe() {
        const token = localStorage.getItem('token'); 
        const response = await fetch(`${API_URL}/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json',
            },
        });
        return response.json();
    },

    logout() {
        localStorage.removeItem('token'); 
        window.location.href = '/login'; 
    }
};
