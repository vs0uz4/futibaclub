-- -----------------------------------------------------
-- Table `vhxa9e9tjj60dtyr`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `vhxa9e9tjj60dtyr`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(245) NULL,
  `email` VARCHAR(255) NULL,
  `passwd` VARCHAR(255) NULL,
  `role` VARCHAR(45) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `vhxa9e9tjj60dtyr`.`groups`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `vhxa9e9tjj60dtyr`.`groups` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(245) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `vhxa9e9tjj60dtyr`.`groups_users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `vhxa9e9tjj60dtyr`.`groups_users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `group_id` INT NOT NULL,
  `role` VARCHAR(45) NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_groups_users_users_idx` (`user_id` ASC),
  INDEX `fk_groups_users_groups1_idx` (`group_id` ASC))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `vhxa9e9tjj60dtyr`.`games`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `vhxa9e9tjj60dtyr`.`games` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `team_a` VARCHAR(245) NULL,
  `team_b` VARCHAR(245) NULL,
  `result_a` INT NULL,
  `result_b` INT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `vhxa9e9tjj60dtyr`.`guessings`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `vhxa9e9tjj60dtyr`.`guessings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `result_a` INT NULL,
  `result_b` INT NULL,
  `score` INT NULL,
  `game_id` INT NOT NULL,
  `group_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_guessings_games1_idx` (`game_id` ASC),
  INDEX `fk_guessings_groups1_idx` (`group_id` ASC),
  INDEX `fk_guessings_users1_idx` (`user_id` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `vhxa9e9tjj60dtyr`.`comments`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `vhxa9e9tjj60dtyr`.`comments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `comment` TEXT NULL,
  `guessing_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_comments_guessings1_idx` (`guessing_id` ASC),
  INDEX `fk_comments_users1_idx` (`user_id` ASC))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Constrains
-- -----------------------------------------------------
ALTER TABLE `vhxa9e9tjj60dtyr`.`groups_users`
ADD CONSTRAINT `fk_groups_users_users`
FOREIGN KEY (`user_id`)
REFERENCES `vhxa9e9tjj60dtyr`.`users` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE `vhxa9e9tjj60dtyr`.`groups_users`
ADD CONSTRAINT `fk_groups_users_groups`
FOREIGN KEY (`group_id`)
REFERENCES `vhxa9e9tjj60dtyr`.`groups` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;


ALTER TABLE `vhxa9e9tjj60dtyr`.`guessings`
ADD CONSTRAINT `fk_guessings_games`
FOREIGN KEY (`game_id`)
REFERENCES `vhxa9e9tjj60dtyr`.`games` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE `vhxa9e9tjj60dtyr`.`guessings`
ADD CONSTRAINT `fk_guessings_groups`
FOREIGN KEY (`group_id`)
REFERENCES `vhxa9e9tjj60dtyr`.`groups` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE `vhxa9e9tjj60dtyr`.`guessings`
ADD CONSTRAINT `fk_guessings_users`
FOREIGN KEY (`user_id`)
REFERENCES `vhxa9e9tjj60dtyr`.`users` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE `vhxa9e9tjj60dtyr`.`comments`
ADD CONSTRAINT `fk_comments_guessings`
FOREIGN KEY (`guessing_id`)
REFERENCES `vhxa9e9tjj60dtyr`.`guessings` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE `vhxa9e9tjj60dtyr`.`comments`
ADD CONSTRAINT `fk_comments_users`
FOREIGN KEY (`user_id`)
REFERENCES `vhxa9e9tjj60dtyr`.`users` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;