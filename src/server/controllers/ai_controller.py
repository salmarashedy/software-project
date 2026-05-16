import os
from flask import jsonify, request

try:
    import google.generativeai as genai
except ImportError:
    genai = None


def _local_refine(text: str) -> str:
    cleaned = text.strip()
    if not cleaned:
        return ''

    lines = [line.strip() for line in cleaned.splitlines() if line.strip()]
    if len(lines) == 1:
        return (
            f"- {lines[0]}\n"
            "- Clarify the desired outcome and success criteria.\n"
            "- Break the work into actionable, testable steps."
        )

    formatted_lines = []
    for line in lines:
        formatted_lines.append(line if line.startswith('-') else f'- {line}')

    return '\n'.join(formatted_lines)

def refine_description():
    data = request.get_json()
    text = data.get('text', '')
    
    if not text:
        return jsonify({"success": False, "error": "No text provided"}), 400

    api_key = os.getenv('GEMINI_API_KEY')
    if genai and api_key:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')

            prompt = f"""
            Refine the following task description to be professional, clear, and action-oriented.
            Use bullet points for structure if it helps clarity.
            Keep the response concise.

            Original text: {text}

            Refined version:
            """

            response = model.generate_content(prompt)
            refined_text = (response.text or '').strip()
            if refined_text:
                return jsonify({"success": True, "refined": refined_text, "provider": "gemini"}), 200
        except Exception as e:
            print(f"AI Error: {e}")

    refined_text = _local_refine(text)
    return jsonify({"success": True, "refined": refined_text, "provider": "local"}), 200
