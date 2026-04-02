
import { axiosInstance } from "./axios";

export const problemService = {

    // create a new problem
    createProblem: async (problemData) => {
        try {
            const response = await axiosInstance.post("/problems/add", problemData);
            return response.data;
        } catch (error) {
            console.error("Error creating problem:", error);
            throw error;
        }
    },

    // get all problems for the current user
    getProblems: async () => {
        try {
            const response = await axiosInstance.get("/problems");
            return response.data;
        } catch (error) {
            console.error("Error fetching problems:", error);
            throw error;
        }
    },

    // get a single problem by ID
    getProblemById: async (problemId) => {
        try {
            const response = await axiosInstance.get(`/problems/${problemId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching problem:", error);
            throw error;
        }
    },

    // update a problem by ID
    updateProblem: async (problemId, updatedData) => {
        try {
            const response = await axiosInstance.put(`/problems/${problemId}`, updatedData);
            return response.data;
        } catch (error) {
            console.error("Error updating problem:", error);
            throw error;
        }
    },

    // delete a problem by ID
    deleteProblem: async (problemId) => {
        try {
            const response = await axiosInstance.delete(`/problems/${problemId}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting problem:", error);
            throw error;
        }
    },


}
