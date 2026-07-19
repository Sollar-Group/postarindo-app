import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, SafeAreaView, useColorScheme } from 'react-native';

const PLACEHOLDER_DATA = [
  { id: '1', title: 'First Post' },
  { id: '2', title: 'Second Post' },
  { id: '3', title: 'Third Post' },
];

type ItemProps = { title: string; isDark: boolean };

const Item = ({ title, isDark }: ItemProps) => (
  <View style={[styles.item, isDark ? styles.itemDark : styles.itemLight]}>
    <Text style={isDark ? styles.textDark : styles.textLight}>{title}</Text>
  </View>
);

export default function App() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDark ? styles.textDark : styles.textLight]}>
          PostaRindo
        </Text>
      </View>
      <FlatList
        data={PLACEHOLDER_DATA}
        renderItem={({ item }) => <Item title={item.title} isDark={isDark} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#F3F4F6', // Neutral light background
  },
  containerDark: {
    backgroundColor: '#111827', // Neutral dark background
  },
  header: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  item: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  itemLight: {
    backgroundColor: '#FFFFFF',
  },
  itemDark: {
    backgroundColor: '#1F2937',
  },
  textLight: {
    color: '#111827',
  },
  textDark: {
    color: '#F9FAFB',
  },
});
