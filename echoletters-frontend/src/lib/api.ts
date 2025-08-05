import { getToken } from "./auth";

export const getCurrentUser = async () => {
    const token = getToken();
    
    if (!token) return null;

    const res = await fetch("http://localhost:5257/api/Auth/me", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        },
    });

    if (!res.ok) {
        console.error("Błąd pobierania danych użytkownika");
        return null;
    }
    
    const data = await res.json();
    return data;
}