import { StatusBar } from 'expo-status-bar'
import { Linking, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'

const WEB_DEV_URL = 'http://127.0.0.1:3000'
const API_DEV_URL = 'http://127.0.0.1:8000'

export default function ExpoApp() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.mark}>
          <Text style={styles.markText}>DV</Text>
        </View>
        <Text style={styles.title}>DecisionVault Mobile Dev</Text>
        <Text style={styles.body}>
          This Expo shell now lives inside decision_vault_ui. Run the Vite UI for the full browser experience, or use this
          shell as the mobile entrypoint while native screens are added.
        </Text>
        <View style={styles.panel}>
          <Text style={styles.label}>Web UI</Text>
          <Text style={styles.mono}>{WEB_DEV_URL}</Text>
          <Text style={styles.label}>Local API</Text>
          <Text style={styles.mono}>{API_DEV_URL}</Text>
        </View>
        <Pressable style={styles.button} onPress={() => Linking.openURL(WEB_DEV_URL)}>
          <Text style={styles.buttonText}>Open Web UI</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  mark: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    marginBottom: 22,
  },
  markText: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '800',
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
  },
  body: {
    color: '#cbd5e1',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 18,
  },
  panel: {
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 8,
    padding: 14,
    backgroundColor: '#111113',
    marginBottom: 18,
  },
  label: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
    textTransform: 'uppercase',
  },
  mono: {
    color: '#e2e8f0',
    fontFamily: 'Courier',
    fontSize: 14,
    marginTop: 4,
  },
  button: {
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
})
