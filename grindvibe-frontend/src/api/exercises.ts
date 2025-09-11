import api from "./client";

export type LIstsResponse = {
    muscles: string[];
    equipment: string[];
};

export function getExerciseLists(){
    return api<LIstsResponse>('/exercises/lists');
}