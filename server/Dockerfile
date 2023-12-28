FROM python:3.12.0-bookworm

ENV PYTHONUNBUFFERED=1

WORKDIR /App

# Create and activate virtual environment
RUN python -m venv venv
ENV PATH="/App/venv/bin:$PATH"

# Upgrade pip
RUN python -m pip install --upgrade pip

# Install dependencies
COPY ./requirements.txt /requirements.txt
RUN pip install -r /requirements.txt

# Copy the rest of the application code
COPY . /App

# Expose the port the app runs on
EXPOSE 8000

# Command to run your application
CMD ["bash", "-c", "python ./manage.py runserver 0.0.0.0:8000"]
