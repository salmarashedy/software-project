import google.generativeai as genai
import os
from flask import jsonify, request

def refine_description():
    data = request.get_json()
    text = data.get('text', '')
    
    if not text:
        return jsonify({"success": False, "error": "No text provided"}), 400
        
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        return jsonify({"success": False, "error": "AI API Key missing"}), 500
        
    try:
        genai.configure(api_key=api_key)
        # Use gemini-1.5-flash which is fast and widely available
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        Refine the following task description to be professional, clear, and action-oriented.
        Use bullet points for structure if it helps clarity.
        Keep the response concise.
        
        Original text: {text}
        
        Refined version:
        """
        
        response = model.generate_content(prompt)
        refined_text = response.text.strip()
        
        return jsonify({"success": True, "refined": refined_text}), 200
    except Exception as e:
        print(f"AI Error: {e}")
        return jsonify({"success": False, "error": "Failed to refine description"}), 500
