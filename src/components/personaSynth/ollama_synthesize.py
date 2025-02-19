import argparse
import json
import requests
from datasets import load_dataset
from tqdm import tqdm
from prompt_templates import instruction_template, knowledge_template, npc_template, math_template, ux_persona_template

# Ollama API endpoint
OLLAMA_API_ENDPOINT = "https://ollama.lg.media/v1/chat/completions"

def generate_response(prompt):
    """
    Sends the prompt to the Ollama API and returns synthesized text.
    """
    payload = {
        "model": "openthinker",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 2000,
        "temperature": 0.7,
        "stop": None
    }
    response = requests.post(OLLAMA_API_ENDPOINT, json=payload)
    if response.status_code != 200:
        raise Exception(f"Ollama API error {response.status_code}: {response.text}")
    res_json = response.json()
    return res_json.get("choices", [{}])[0].get("message", {}).get("content", "")

def main(args):
    # Load the appropriate template
    if args.template == "instruction":
        template = instruction_template
    elif args.template == "knowledge":
        template = knowledge_template
    elif args.template == "npc":
        template = npc_template
    elif args.template == "ux_persona":
        template = ux_persona_template
    elif args.template == "math":
        template = math_template
    else:
        raise ValueError("Invalid template type. Choose from 'instruction', 'knowledge', 'npc', 'math', or 'ux_persona'.")

    # Load the dataset
    persona_dataset = load_dataset("proj-persona/PersonaHub", data_files="persona.jsonl")['train']
    if args.sample_size > 0:
        persona_dataset = persona_dataset[:args.sample_size]
    print(f"Total number of input personas: {len(persona_dataset['persona'])}")

    with open(args.output_path, "w") as out:
        for persona in tqdm(persona_dataset['persona']):
            persona = persona.strip()
            user_prompt = template.format(persona=persona)
            try:
                synthesized_text = generate_response(user_prompt)
                o = {
                    "user_prompt": user_prompt,
                    "input persona": persona,
                    "synthesized text": synthesized_text
                }
            except Exception as e:
                o = {
                    "user_prompt": user_prompt,
                    "input persona": persona,
                    "synthesized text": f"Error: {str(e)}"
                }
            out.write(json.dumps(o, ensure_ascii=False) + '\n')

    print(f"Outputted the results to: {args.output_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Synthesize text using Ollama API.")
    parser.add_argument('--sample_size', type=int, default=0, help='Number of samples to process from the dataset; Set it to 0 if you want to use the full set of 200k personas.')
    parser.add_argument(
        '--template',
        type=str,
        required=True,
        choices=['instruction', 'knowledge', 'npc', 'math', 'ux_persona'],
        help=(
            "Prompt templates. Choose from 'instruction', 'knowledge', 'math', 'npc', or 'ux_persona'. "
            "You can also add more customized templates in prompt_templates.py"
        )
    )
    parser.add_argument('--output_path', type=str, required=True, help='Path to the output file.')

    args = parser.parse_args()
    main(args) 