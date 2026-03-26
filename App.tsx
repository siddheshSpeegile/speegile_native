// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  */

// import { NewAppScreen } from '@react-native/new-app-screen';
// import { Text } from 'lucide-react';
// import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
// import {
//   SafeAreaProvider,
//   useSafeAreaInsets,
// } from 'react-native-safe-area-context';

// function App() {
//   const isDarkMode = useColorScheme() === 'dark';

//   return (
//     <SafeAreaProvider>
//       <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
//       <AppContent />
//     </SafeAreaProvider>
//   );
// }

// function AppContent() {
//   const safeAreaInsets = useSafeAreaInsets();

//   return (
//     <View style={styles.container}>
//       <NewAppScreen
//         templateFileName="App.tsx"
//         safeAreaInsets={safeAreaInsets}
        
//       />
//       <Text>Testing</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     color:'red',
//     fontWeight: 'bold'
//   },

//   tesx: {
//     color:'red'
//   }
// });

// export default App;

import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Alert, ActivityIndicator,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

const BASE_URL = "https://speegile-backend.onrender.com";

export default function App() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [editingUser, setEditing] = useState(null);
  const [form, setForm]           = useState({ name: "", email: "", age: "" });

  useEffect(() => { fetchUsers(); }, []);

  // ─── READ ─────────────────────────────────────────
  // const fetchUsers = async () => {
  //   setLoading(true);
  //   try {
  //     const res  = await fetch(`${BASE_URL}/users`);
  //     const data = await res.json();
  //     setUsers(data);
  //   } catch (err) {
  //     Alert.alert("Error", "Failed to fetch users");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchUsers = async () => {
  setLoading(true);
  try {
    const res  = await fetch(`${BASE_URL}/users`);
    const data = await res.json();
    console.log("✅ Users fetched:", data);
    setUsers(data);
  } catch (err) {
    console.log("❌ Fetch error:", err.message); // 👈 see exact error
    Alert.alert("Error", err.message);           // 👈 shows real error on screen
  } finally {
    setLoading(false);
  }
};

  // ─── CREATE ───────────────────────────────────────
  const createUser = async () => {
    if (!form.name || !form.email) {
      return Alert.alert("Validation", "Name and Email are required");
    }
    try {
      const res = await fetch(`${BASE_URL}/users`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...form, age: Number(form.age) }),
      });
      if (!res.ok) {
        const err = await res.json();
        return Alert.alert("Error", err.error);
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      Alert.alert("Error", "Create failed");
    }
  };

  // ─── UPDATE ───────────────────────────────────────
  const updateUser = async () => {
    if (!form.name || !form.email) {
      return Alert.alert("Validation", "Name and Email are required");
    }
    try {
      const res = await fetch(`${BASE_URL}/users/${editingUser.id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...form, age: Number(form.age) }),
      });
      if (!res.ok) return Alert.alert("Error", "Update failed");
      resetForm();
      fetchUsers();
    } catch (err) {
      Alert.alert("Error", "Update failed");
    }
  };

  // ─── DELETE ───────────────────────────────────────
  const deleteUser = (id) => {
    Alert.alert("Confirm", "Delete this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await fetch(`${BASE_URL}/users/${id}`, { method: "DELETE" });
            fetchUsers();
          } catch {
            Alert.alert("Error", "Delete failed");
          }
        },
      },
    ]);
  };

  // ─── HELPERS ──────────────────────────────────────
  const startEdit = (user) => {
    setEditing(user);
    setForm({ name: user.name, email: user.email, age: String(user.age ?? "") });
  };

  const resetForm = () => {
    setEditing(null);
    setForm({ name: "", email: "", age: "" });
  };

  // ─── RENDER ───────────────────────────────────────
  const renderUser = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardSub}>{item.email}</Text>
        {item.age ? <Text style={styles.cardSub}>Age: {item.age}</Text> : null}
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => startEdit(item)}>
          <Text style={styles.btnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteUser(item.id)}>
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>User Manager</Text>

      {/* Form */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Name *"
          value={form.name}
          onChangeText={(v) => setForm({ ...form, name: v })}
        />
        <TextInput
          style={styles.input}
          placeholder="Email *"
          value={form.email}
          onChangeText={(v) => setForm({ ...form, email: v })}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Age"
          value={form.age}
          onChangeText={(v) => setForm({ ...form, age: v })}
          keyboardType="numeric"
        />
        <View style={styles.formBtns}>
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={editingUser ? updateUser : createUser}
          >
            <Text style={styles.submitText}>
              {editingUser ? "✏️ Update User" : "➕ Add User"}
            </Text>
          </TouchableOpacity>
          {editingUser && (
            <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
              <Text style={styles.submitText}>✕ Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" color="#6C63FF" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderUser}
          ListEmptyComponent={
            <Text style={styles.empty}>No users yet. Add one above!</Text>
          }
          refreshing={loading}
          onRefresh={fetchUsers}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: "#F0F2F5", padding: 16 },
  title:       { fontSize: 26, fontWeight: "700", color: "#1A1A2E", marginBottom: 16, textAlign: "center", marginStart: 5 },
  form:        { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, elevation: 3 },
  input:       { borderWidth: 1, borderColor: "#DDE3EC", borderRadius: 8, padding: 10, marginBottom: 10, fontSize: 14 },
  formBtns:    { flexDirection: "row", gap: 8 },
  submitBtn:   { flex: 1, backgroundColor: "#6C63FF", padding: 12, borderRadius: 8, alignItems: "center" },
  cancelBtn:   { flex: 1, backgroundColor: "#FF6B6B", padding: 12, borderRadius: 8, alignItems: "center" },
  submitText:  { color: "#fff", fontWeight: "600" },
  card:        { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: "row", alignItems: "center", elevation: 2 },
  cardInfo:    { flex: 1 },
  cardName:    { fontSize: 16, fontWeight: "600", color: "#1A1A2E" },
  cardSub:     { fontSize: 13, color: "#888", marginTop: 2 },
  cardActions: { flexDirection: "row", gap: 8 },
  editBtn:     { backgroundColor: "#6C63FF", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  deleteBtn:   { backgroundColor: "#FF6B6B", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnText:     { color: "#fff", fontSize: 13, fontWeight: "600" },
  empty:       { textAlign: "center", color: "#aaa", marginTop: 40, fontSize: 15 },
});
