CREATE DATABASE IF NOT EXISTS marvel_battle;
CREATE USER IF NOT EXISTS 'knikonov'@'localhost' IDENTIFIED BY 'secure_pass';
GRANT ALL ON cards_web.* TO 'knikonov'@'localhost';
USE marvel_battle;

FLUSH PRIVILEGES;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar VARCHAR(255),
    health INT DEFAULT 20,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player1_id INT NOT NULL,
    player2_id INT DEFAULT NULL,
    status ENUM('waiting', 'active', 'finished') DEFAULT 'waiting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (player2_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    character_name VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    attack INT NOT NULL,
    defense INT NOT NULL,
    cost INT NOT NULL
);

CREATE TABLE player_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    card_id INT NOT NULL,
    room_id INT NOT NULL,
    health INT NOT NULL,
    FOREIGN KEY (player_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE TABLE turns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    player_id INT NOT NULL,
    turn_number INT NOT NULL,
    action VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO cards (character_name, avatar, attack, defense, cost)
VALUES
('Spider-Man', 'https://i.ibb.co/6YhkSvt/image.png', 6, 8, 3),
('Daredevil', 'https://i.ibb.co/LQC2kXW/image.png', 8, 9, 4),
('Captain America', 'https://i.ibb.co/WPff2XN/image.png', 7, 8, 3),
('Dormammu', 'https://i.ibb.co/zPBz8YW/image.png', 9, 4, 5),
('Bkack Cat', 'https://i.ibb.co/3SdRg4y/image.png', 10, 12, 6),
('Venom', 'https://i.ibb.co/N75qQrQ/image.png', 6, 5, 2),
('Green Goblin', 'https://i.ibb.co/Yyt2SMw/image.png', 7, 9, 4),
('Thanos', 'https://i.ibb.co/rtcBPMG/image.png', 8, 8, 5),
('Lizard', 'https://i.ibb.co/7KgNCj3/image.png', 6, 4, 3),
('Wasp', 'https://i.ibb.co/NssGFhS/image.png', 7, 5, 4),
('Human Torch', 'https://i.ibb.co/ZGCyzqK/image.png', 8, 6, 5),
('Black Panther', 'https://i.ibb.co/VH8D6mv/image.png', 7, 7, 4),
('Thor', 'https://i.ibb.co/tBFzNPj/image.png', 5, 4, 2),
('Cyclops', 'https://i.ibb.co/7yNNLrL/image.png', 6, 3, 3),
('Marvel Girl', 'https://i.ibb.co/mbQ6Hf3/image.png', 5, 6, 4),
('Iceman', 'https://i.ibb.co/hDkNG9R/image.png', 7, 5, 4),
('Wolverine', 'https://i.ibb.co/jHNQx6W/image.png', 6, 4, 3),
('Shadowcat', 'https://i.ibb.co/ZMqyCjt/image.png', 8, 11, 5),
('Moon knight', 'https://i.ibb.co/vDkWhKv/image.png', 7, 4, 3),
('Juggernaut', 'https://i.ibb.co/zfxRvn1/image.png', 6, 3, 2),
('Doctor octopus', 'https://i.ibb.co/3k4Rnb9/image.png', 7, 9, 4);