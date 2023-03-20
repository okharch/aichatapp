import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Clipboard,
  Alert,
} from 'react-native';
import axios from 'axios';
import { secrets } from './secrets';

const renderItem = ({ item }) => {
  return (
    <View
      style={
        item.type === 'question' ? styles.questionContainer : styles.answerContainer
      }
    >
      <Text
        style={
          item.type === 'question' ? styles.questionText : styles.answerText
        }
        //onPress={() => item.type === 'question' && handleCopy(item.text)}
      >
        {item.text}
      </Text>
    </View>
  );
};


const getAnswer = async (question) => {
  const OPENAI_API_KEY = secrets.OPENAI_API_KEY;
  const prompt = question.trim();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
  };
  const data = JSON.stringify({
     "model": "gpt-3.5-turbo",
     "messages": [{"role": "user", "content": prompt}],
     "temperature": 0.7
     });
  const response = await axios.post('https://api.openai.com/v1/chat/completions', data, { headers });
  const answer = response.data.choices[0].message.content.trim();
  return answer;
};

const delay = ms => new Promise(res => setTimeout(res, ms));

export default function App() {
  const [text, setText] = useState('');
  const [label, setLabel] = useState('Type a question ...');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

const handleSend = async (question) => {
    if (loading) {
        alert('Already being processed!');
        return;
    }
    try {
      setLoading(true);
      setText('');
      setLabel('Processing request ...');
      // make API request here
      if (question) {
      // await your long request
        const answer = await getAnswer(question);
        setData([...data, { id: data.length, type: 'question', text: question }, { id: data.length + 1, type: 'answer', text: answer }]);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
    setLabel('Type a question...');
};

  useEffect(() => {
    const welcomeMessage = {
      id: 0,
      type: 'answer',
      text: 'Hello! How can I help you today?',
    };
    setData([welcomeMessage]);
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={label}
          placeholderTextColor="#8c8c8c"
        />
        <TouchableOpacity style={styles.sendButton} activeOpacity={loading ? 1 : 0.7} onPress={() => !loading && handleSend(text)} disabled={loading}>
          <Text style={styles.sendButtonText}>&#10148;</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  questionContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#f2f2f2',
    padding: 10,
    marginVertical: 5,
    marginLeft: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  answerContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#d4edda',
    padding: 10,
    marginVertical: 5,
    marginRight: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  questionText: {
    fontSize: 16,
  },
  answerText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    padding: 10,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 10,
    color: '#000',
  },
  sendButton: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
