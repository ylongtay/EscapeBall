import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Button,
} from "react-native";
import axios from "axios";
import { WebView } from "react-native-webview";

const App = () => {
  const [headlines, setHeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState("");
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  useEffect(() => {
    fetchHeadlines(page);
  }, [page]);

  const fetchHeadlines = async (pageNumber) => {
    try {
      if (pageNumber === 1) {
        setLoading(true);
      } else {
        setIsFetchingMore(true);
      }
      const response = await axios.get("https://newsapi.org/v2/top-headlines", {
        params: {
          sources: "techcrunch",
          apiKey: "your_api_key_here",
          page: pageNumber,
          pageSize: 10, // You can adjust this value as needed
        },
      });
      setHeadlines((prevHeadlines) => [
        ...prevHeadlines,
        ...response.data.articles,
      ]);
      setLoading(false);
      setIsFetchingMore(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  const loadMoreArticles = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const openArticle = (url) => {
    setSelectedUrl(url);
    setModalVisible(true);
  };

  if (loading && page === 1) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={headlines}
        keyExtractor={(item) => item.url}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openArticle(item.url)}>
            <View style={styles.item}>
              <Text style={styles.title}>{item.title}</Text>
              {item.author && (
                <Text style={styles.author}>By {item.author}</Text>
              )}
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          !loading && (
            <View style={styles.footer}>
              {isFetchingMore ? (
                <ActivityIndicator size="small" color="#0000ff" />
              ) : (
                <Button title="Load More" onPress={loadMoreArticles} />
              )}
            </View>
          )
        }
      />
      <Modal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Button title="Close" onPress={() => setModalVisible(false)} />
          {selectedUrl !== "" && (
            <WebView source={{ uri: selectedUrl }} style={styles.webView} />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 10,
  },
  item: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
    width: "100%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  author: {
    fontSize: 14,
    color: "#888",
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    color: "#555",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  webView: {
    flex: 1,
  },
  footer: {
    padding: 10,
    alignItems: "center",
  },
});

export default App;
