import os
from flask import Flask, render_template, request, jsonify
from google import genai
import urllib.parse

app = Flask(__name__)

# Initialize Google GenAI client with your API key
client = genai.Client(api_key="YOUR_GOOGLE_GENAI_API_KEY")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/ask', methods=['POST'])
def ask_ai():
    data = request.get_json()
    query = data.get('query', '').strip()
    
    if not query:
        return jsonify({"query": "", "answer": "Please ask a valid question.", "video_url": "https://www.youtube.com/embed/g2O2qLHeh_0"})

    try:
        # Prompt Gemini to provide both the concise answer AND a precise search keyword for the video
        prompt = f"""You are FocusTV AI, an intelligent study assistant for students of all age groups.
        Student Query: '{query}'
        
        Provide two things separated by the exact token '|||':
        1. A clear, accurate, educational explanation (under 3 sentences) suitable for a TV screen.
        2. A short 2-3 word YouTube search query optimized to find the best tutorial video for this exact topic.
        
        Example format:
        Explanation sentence goes here...|||topic search keywords
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        # Parse the generative output
        parts = response.text.strip().split('|||')
        ai_answer = parts[0].strip()
        
        # Extract or fallback to the user's query for the dynamic video stream
        video_search_term = parts[1].strip() if len(parts) > 1 else query
        
        # Dynamically encode the query into a YouTube embed search stream or playlist URL
        encoded_query = urllib.parse.quote(video_search_term + " tutorial classroom")
        video_url = f"https://www.youtube.com/embed?listType=search&list={encoded_query}"

    except Exception as e:
        ai_answer = f"FocusTV AI encountered an error processing your request: {str(e)}"
        video_url = "https://www.youtube.com/embed/kJQP7kiw5Fk"

    return jsonify({
        "query": query,
        "answer": ai_answer,
        "video_url": video_url
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)