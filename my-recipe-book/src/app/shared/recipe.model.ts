export interface RecipeModel {
    id: string;
    name: string;
    ingredients: string[];
    instructions: string[];
    tags: string[];
    votes: number;
    voters: string[];
    imgPath: string;
    creatorUsername: string;
    creatorId: string;
    createdAt: string
}