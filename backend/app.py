import sys
import os
from zlm.prompts.resume_prompt import RESUME_WRITER_PERSONA
from zlm import AutoApplyModel

# Set USER_AGENT environment variable to avoid warnings
os.environ['USER_AGENT'] = 'YourAppName/1.0'

def process_resume(resume_path, job_description, recruiter_prompt, api_key, provider, model):
    # Process the resume using AutoApplyModel
    resume_llm = AutoApplyModel(
        api_key=api_key,
        provider=provider,
        model=model,
        downloads_dir="output",
        system_prompt=RESUME_WRITER_PERSONA + recruiter_prompt
    )

    # Attempt to extract user data from the resume
    user_data = resume_llm.user_data_extraction(resume_path)
    if user_data is None:
        print("Error: Failed to extract data from resume.")
        sys.exit(1)

    # Attempt to extract job details
    job_details, _ = resume_llm.job_details_extraction(job_site_content=job_description)
    if not job_details:
        print("Error: Failed to extract job details.")
        sys.exit(1)

    # Build the processed resume
    processed_resume_path, _ = resume_llm.resume_builder(job_details, user_data)
    print(processed_resume_path)

    #Ensure the `public/generated` folder exists
    output_dir = os.path.join(os.getcwd(), 'public', 'generated')
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Prepare destination path
    destination_path = os.path.join(output_dir, os.path.basename(processed_resume_path))

    # If the file exists, remove it before renaming
    if os.path.exists(destination_path):
        os.remove(destination_path)

    # Move the processed file to the `generated` folder
    os.rename(processed_resume_path, destination_path)
    print(f"File saved at: {destination_path}") 

    #Return the path to the generated resume file 
    return destination_path
if __name__ == "__main__":
    if len(sys.argv) != 7:
        print("Invalid arguments. Expected 6 arguments.")
        sys.exit(1)

    resume_path = sys.argv[1]
    job_description = sys.argv[2]
    recruiter_prompt = sys.argv[3]
    api_key = sys.argv[4]
    provider = sys.argv[5]
    model = sys.argv[6]

    print(recruiter_prompt)
    print(job_description)
    print(provider)
    print(api_key)
    print(model)
    print(resume_path)

    # Process the resume and print the path to the generated file
    processed_resume_path = process_resume(resume_path, job_description, recruiter_prompt, api_key, provider, model)
    print(processed_resume_path)
