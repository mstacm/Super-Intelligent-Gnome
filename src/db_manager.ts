import Database, { Database as DatabaseType, Statement } from "better-sqlite3";
import { logBot } from "./logging_config";

const DB_PATH: string = "./db/song_queue.db";

interface songObj {
  // eslint-disable-next-line camelcase
  q_num: number;
  title: string;
}

// Create the tables if they aren't already in there
function createTables() {
  const db: DatabaseType = new Database(DB_PATH);
  const createSongs: Statement = db.prepare(`CREATE TABLE IF NOT EXISTS songs (
        q_num INT,
        server TEXT,
        title TEXT,
        url TEXT
    )`);

  const createServerData: Statement = db.prepare(`CREATE TABLE IF NOT EXISTS server_data (
        server_name TEXT,
        curr_song INT,
        PRIMARY KEY(server_name)
    )`);

  createSongs.run();
  createServerData.run();
  db.close();
}

// Add a song to the queue for a server
function addToQueue(serverName: string, title: string, url: string) {
  const db = new Database(DB_PATH);
  const updateTable: Statement = db.prepare(`INSERT INTO songs(q_num, server, title, url)
    SELECT COUNT(q_num)+1, ?, ?, ? 
    FROM songs 
    WHERE server = ?`);

  updateTable.run([serverName, title, url, serverName]);
  db.close();
}

// Pass the server name for the queue to be cleared for that server
function clearQueue(serverName: string) {
  const db = new Database(DB_PATH);

  const clearServerData: Statement = db.prepare(
    `UPDATE server_data SET curr_song = -1 WHERE server_name = ?`
  );
  const clearSongData: Statement = db.prepare(
    `DELETE FROM songs WHERE server = ?`
  );

  clearServerData.run([serverName]);
  clearSongData.run([serverName]);
  db.close();
}

// List all songs in the queue for this server
function listQueue(serverName: string): songObj[] {
  const db = new Database(DB_PATH);
  const selectSongs: Statement = db.prepare(
    `SELECT q_num, title FROM songs WHERE server = ? ORDER BY q_num`
  );
  const data = selectSongs.all([serverName]);
  db.close();
  return data;
}

export { addToQueue, createTables, clearQueue, listQueue };
