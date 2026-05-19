import * as SQLite from 'expo-sqlite';

//----------------------------------------------------------------------------
// Função para abrir ou criar  o banco de dados
async function Banco() {
    // Open the database
    try {
        const db = await SQLite.openDatabaseAsync('DDM2.db');
        console.log('Banco de dados aberto');
        return db;
    } catch (error) {
        console.log(error);

    }
}


//----------------------------------------------------------------------------
async function createTable(db: SQLite.SQLiteDatabase) {

    try {
        await db.execAsync(`
            PRAGMA journal_mode = WAL;
                CREATE TABLE IF NOT EXISTS USUARIO (
                    ID_US  INTEGER PRIMARY KEY AUTOINCREMENT,
                    NOME_US VARCHAR(100),
                    EMAIL_US VARCHAR(100),
                    TELEFONE_US VARCHAR(50),
                    CEP_US VARCHAR(20),
                    NUMERO_US VARCHAR(20),
                    ENDERECO_US VARCHAR(200)
                );
`
        ) ;

        const columns = await db.getAllAsync("PRAGMA table_info('USUARIO')");
        const columnNames = columns.map((col) => col.name);

        if (!columnNames.includes('TELEFONE_US')) {
            await db.execAsync('ALTER TABLE USUARIO ADD COLUMN TELEFONE_US VARCHAR(50)');
        }
        if (!columnNames.includes('CEP_US')) {
            await db.execAsync('ALTER TABLE USUARIO ADD COLUMN CEP_US VARCHAR(20)');
        }
        if (!columnNames.includes('NUMERO_US')) {
            await db.execAsync('ALTER TABLE USUARIO ADD COLUMN NUMERO_US VARCHAR(20)');
        }
        if (!columnNames.includes('ENDERECO_US')) {
            await db.execAsync('ALTER TABLE USUARIO ADD COLUMN ENDERECO_US VARCHAR(200)');
        }

        console.log('Tabela USUARIO criada ou atualizada');
    } catch (error) {
        console.log('Erro ao criar tabela', error);

    }

}
//----------------------------------------------------------------------------

//Inserir novo usuario

async function insertUsuario(db: SQLite.SQLiteDatabase,
    nome: string, email: string, telefone: string, cep: string, numero: string, endereco: string) {
    try {
        await db.runAsync(
            " INSERT INTO USUARIO (NOME_US, EMAIL_US, TELEFONE_US, CEP_US, NUMERO_US, ENDERECO_US) VALUES ( ? , ? , ? , ? , ? , ? )",
             nome, email, telefone, cep, numero, endereco);
        console.log('Usuario inserido');

    } catch (error) {
        console.log('Erro ao inserir usuario', error);
    }
}

//----------------------------------------------------------------------------

// Exibir todos os usuarios


async function selectUsuarios(db: SQLite.SQLiteDatabase) {
    try {
        const result = await db.getAllAsync('SELECT * FROM USUARIO ORDER BY ID_US DESC');
        console.log('Usuarios encontrados');
        return result;
    } catch (erro) {
        console.log('Erro ao buscar usuarios', erro);
    }}

//----------------------------------------------------------------------------

// Exibir usuario pelo ID
async function selectUsuarioById(db: SQLite.SQLiteDatabase, id: number){
    try {
        const result = await db.getFirstAsync('SELECT * FROM USUARIO WHERE ID_US = ?', id);
        console.log('Usuario encontrado');
        return result;
    } catch (erro) {
        console.log('Erro ao buscar usuario', erro);
    }
}

//----------------------------------------------------------------------------

//usuario pelo nome
async function selectUsuarioNome(db: SQLite.SQLiteDatabase, nome: string) {
    try {
        const result = await db.getAllAsync('SELECT * FROM USUARIO WHERE NOME_US = ?', nome);
        console.log('Usuario encontrado');
        return result;
    } catch (erro) {
        console.log('Erro ao buscar usuario', erro);
    }
}


//----------------------------------------------------------------------------

// Excluir usuario pelo ID
async function deleteUsuario(db: SQLite.SQLiteDatabase, id: number) {
    try {
        await db.runAsync(' DELETE FROM USUARIO WHERE ID_US = ? ', id);
        console.log('Usuario excluido');
    } catch (error) {
        console.log('Erro ao excluir usuario', error);
    }
}
//----------------------------------------------------------------------------

//ALTERAR USUARIO
async function updateUsuario(db: SQLite.SQLiteDatabase, id: number, nome: string, email: string, telefone: string, cep: string, numero: string, endereco: string) {
    try {
        await db.runAsync(
            'UPDATE USUARIO SET NOME_US = ?, EMAIL_US = ?, TELEFONE_US = ?, CEP_US = ?, NUMERO_US = ?, ENDERECO_US = ? WHERE ID_US = ?',
            nome,
            email,
            telefone,
            cep,
            numero,
            endereco,
            id
        );
        console.log('Usuario atualizado');
    } catch (error) {
        console.log('Erro ao atualizar usuario', error);
    }
}

// drop tabela

async function dropTable(db:SQLite.SQLiteDatabase) {
        await db.execAsync('DROP TABLE IF EXISTS USUARIO');
        console .log('Tabela USUARIO excluida');
}

export {
    Banco, createTable, insertUsuario, selectUsuarios, selectUsuarioById, selectUsuarioNome
    , deleteUsuario, updateUsuario, dropTable
};