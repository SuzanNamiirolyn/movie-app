import { Client, Databases, Query, ID } from 'appwrite';

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const TABLES_ID = import.meta.env.VITE_APPWRITE_TABLES_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID);

const database = new Databases(client);

export const updateSearhCount = async (searchTerm, movie) => {

    // 1. Use Appwrite SDK to check if the search term exists in the database
    try {
        const result = await database.listDocuments(DATABASE_ID, TABLES_ID, [
        Query.equal('searchTerm', searchTerm),
        ]);

    // 2. If it does, update the count
        if(result.documents.length > 0) {
            const doc = result.documents[0];

            await database.updateDocument(DATABASE_ID, TABLES_ID, doc.$id, {
                count: doc.count + 1,
            })

    // 3. If it doesn't, create a new document with the search term and count as 1

        } else {
            await database.createDocument(DATABASE_ID, TABLES_ID, ID.unique(), {
                searchTerm: searchTerm,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            });

        }

    } catch (error) {
        console.error(error);
    }

    console.log(PROJECT_ID, DATABASE_ID, TABLES_ID);
};

export const getTrendingMovies = async () => {
    try {
        const result = await database.listDocuments(DATABASE_ID, TABLES_ID, [
            Query.limit(5),
            Query.orderDesc('count'),
        ]);

        return result.documents;
    } catch (error) {
        console.error(error);
    }
};