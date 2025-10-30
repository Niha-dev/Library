# ---------- main.tf ----------

provider "aws" {
  region = "eu-north-1"  # Change if you prefer another region
}

# Create security group for SSH + HTTP
resource "aws_security_group" "web_sg" {
  name        = "bookworm-sg"   # <-- changed name
  description = "Allow HTTP and SSH"


  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Launch EC2 instance and automate deployment
resource "aws_instance" "app_server" {
  ami           = "ami-0aa78f446b4499266" # Amazon Linux 2 for eu-north-1
  instance_type = "t3.micro"
  security_groups = [aws_security_group.web_sg.name]

  user_data = <<-EOF
    #!/bin/bash
    set -e
    yum update -y
    yum install -y docker git

    # Start Docker service
    systemctl start docker
    systemctl enable docker
    usermod -aG docker ec2-user

    # Install specific version of Docker Compose (v2.28)
    curl -L "https://github.com/docker/compose/releases/download/v2.28.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose

    # Clone the EmailFlow repository
    cd /home/ec2-user
    git clone https://github.com/priyanka-dasari/BookWorm-main.git
    cd BookWorm-main

    # Ensure Dockerfile and docker-compose.yml exist
    if [ -f "docker-compose.yml" ]; then
        /usr/local/bin/docker-compose down || true
        /usr/local/bin/docker-compose up -d --build --remove-orphans
    else
        echo "docker-compose.yml not found in repository!"
    fi

    # Configure Docker to restart containers automatically
    docker update --restart always $(docker ps -q)
  EOF

  tags = {
    Name = "emailflow-ec2"
  }
}