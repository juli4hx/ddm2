import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Banco,
  createTable,
  deleteUsuario,
  insertUsuario,
  selectUsuarios,
  updateUsuario,
} from './Banco/Config';

export default function App() {
  const [db, setDb] = useState(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    async function initDatabase() {
      const database = await Banco();
      if (!database) {
        Alert.alert('Erro', 'Não foi possível abrir o banco de dados');
        return;
      }

      setDb(database);
      await createTable(database);
      await carregarUsuarios(database);
    }

    initDatabase();
  }, []);

  async function carregarUsuarios(database = db) {
    if (!database) {
      return;
    }

    const resp = await selectUsuarios(database);
    setUsuarios(resp || []);
  }

  function formatCep(text) {
    return text.replace(/\D/g, '');
  }

  function handleCepChange(text) {
    setCep(formatCep(text));
  }

  async function buscarCep() {
    const cleanCep = formatCep(cep);
    if (cleanCep.length !== 8) {
      Alert.alert('Atenção', 'Informe um CEP válido de 8 dígitos.');
      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        Alert.alert('CEP não encontrado', 'Verifique o CEP e tente novamente.');
        return;
      }

      const enderecoFinal = `${data.logradouro || ''}${data.logradouro ? ', ' : ''}${data.bairro || ''}${data.localidade ? ' - ' : ''}${data.localidade || ''}${data.uf ? '/' + data.uf : ''}`.trim();
      setEndereco(enderecoFinal);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível buscar o CEP. Tente novamente.');
    }
  }

  async function handleSalvar() {
    if (!nome.trim() || !email.trim() || !telefone.trim() || !cep.trim() || !endereco.trim() || !numero.trim()) {
      Alert.alert('Atenção', 'Preencha nome, email, telefone, CEP, número e endereço antes de salvar.');
      return;
    }

    if (!db) {
      Alert.alert('Erro', 'Banco de dados não inicializado');
      return;
    }

    if (editingId) {
      await updateUsuario(db, editingId, nome.trim(), email.trim(), telefone.trim(), cep.trim(), numero.trim(), endereco.trim());
      Alert.alert('Sucesso', 'Registro atualizado com sucesso');
    } else {
      await insertUsuario(db, nome.trim(), email.trim(), telefone.trim(), cep.trim(), numero.trim(), endereco.trim());
      Alert.alert('Sucesso', 'Registro salvo com sucesso');
    }

    setNome('');
    setEmail('');
    setTelefone('');
    setCep('');
    setNumero('');
    setEndereco('');
    setEditingId(null);
    await carregarUsuarios();
  }

  function handleEditar(item) {
    setNome(item.NOME_US || '');
    setEmail(item.EMAIL_US || '');
    setTelefone(item.TELEFONE_US || '');
    setCep(item.CEP_US || '');
    setEndereco(item.ENDERECO_US || '');
    setNumero(item.NUMERO_US || '');
    setEditingId(item.ID_US);
  }

  async function handleExcluir(id) {
    if (!db) {
      return;
    }

    Alert.alert('Excluir usuário', 'Deseja realmente excluir este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await deleteUsuario(db, id);
          if (editingId === id) {
            setNome('');
            setEmail('');
            setCep('');
            setNumero('');
            setEndereco('');
            setEditingId(null);
          }
          await carregarUsuarios();
        },
      },
    ]);
  }

  function handleCancelarEdicao() {
    setNome('');
    setEmail('');
    setTelefone('');
    setCep('');
    setEndereco('');
    setNumero('');
    setEditingId(null);
  }

  const usuariosFiltrados = usuarios.filter(item => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return true;
    }
    const nomeSearch = (item.NOME_US || '').toLowerCase();
    const emailSearch = (item.EMAIL_US || '').toLowerCase();
    const telefoneSearch = (item.TELEFONE_US || '').toLowerCase();
    const enderecoSearch = (item.ENDERECO_US || '').toLowerCase();
    return (
      nomeSearch.includes(query) ||
      emailSearch.includes(query) ||
      telefoneSearch.includes(query) ||
      enderecoSearch.includes(query)
    );
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Cadastro de Usuário</Text>

          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={nome}
            onChangeText={setNome}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Telefone"
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
          />
          <View style={styles.cepRow}>
            <TextInput
              style={[styles.input, styles.cepInput]}
              placeholder="CEP"
              value={cep}
              onChangeText={handleCepChange}
              keyboardType="numeric"
              maxLength={8}
            />
            <TouchableOpacity style={styles.cepButton} onPress={buscarCep}>
              <Text style={styles.buttonText}>Buscar CEP</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Endereço"
            value={endereco}
            onChangeText={setEndereco}
          />
          <TextInput
            style={styles.input}
            placeholder="Número"
            value={numero}
            onChangeText={setNumero}
            keyboardType="numeric"
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSalvar}>
              <Text style={styles.buttonText}>{editingId ? 'Atualizar' : 'Salvar'}</Text>
            </TouchableOpacity>
            {editingId ? (
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelarEdicao}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Buscar por nome, email, telefone ou endereço"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />

        <Text style={styles.listTitle}>Registros</Text>

        <FlatList
          data={usuariosFiltrados}
          keyExtractor={(item, index) => (item.ID_US ? item.ID_US.toString() : index.toString())}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum usuário cadastrado ainda.</Text>}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.NOME_US}</Text>
                <Text style={styles.itemEmail}>{item.EMAIL_US}</Text>
                <Text style={styles.itemEmail}>{item.TELEFONE_US}</Text>
                <Text style={styles.itemAddress}>Número: {item.NUMERO_US}</Text>
                <Text style={styles.itemAddress}>{item.ENDERECO_US}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.editButton} onPress={() => handleEditar(item)}>
                  <Text style={styles.actionText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleExcluir(item.ID_US)}>
                  <Text style={styles.actionText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffe4f2',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff0f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cepInput: {
    flex: 1,
  },
  cepButton: {
    marginLeft: 12,
    backgroundColor: '#d63384',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#e83e8c',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: '#fb7185',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  listContainer: {
    paddingBottom: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 32,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e6e6e6',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemEmail: {
    color: '#555',
  },
  itemAddress: {
    color: '#555',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#ff85c0',
    marginRight: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  deleteButton: {
    backgroundColor: '#d6336c',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
  },
});
