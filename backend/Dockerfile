# builder
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user -r requirements.txt

# runtime image
FROM python:3.11-slim
ENV PATH=/root/.local/bin:$PATH
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
