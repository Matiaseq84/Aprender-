import { readFile, writeFile } from 'fs/promises'

export async function readData(DB_FILE)  {
    try {
        const data = await readFile(DB_FILE, 'utf-8')
        return JSON.parse(data)
        
    } catch {
        return []
    }
}

export async function writeData(DB_FILE, data) {
    try {
        await writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error al escribir el archivo JSON:', error);
    throw error;
  }
}