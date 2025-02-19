#!/bin/bash

template=ux_persona   # can also be "instruction", "npc" or "knowledge"; try others if you like.
sample_size=10       # use sample_size=0 for the full dataset.
out_path=ollama_${template}_synthesis_output.jsonl

# Make sure required Python libs such as requests are installed.
PYTHONPATH=. python3 components/personaSynth/ollama_synthesize.py --template $template --sample_size $sample_size --output_path $out_path 