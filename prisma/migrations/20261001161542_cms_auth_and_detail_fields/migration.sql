-- AlterTable
ALTER TABLE `achievements` ADD COLUMN `event_date` DATE NULL,
    ADD COLUMN `event_location` VARCHAR(200) NULL,
    ADD COLUMN `is_featured` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `organizer` VARCHAR(200) NULL,
    ADD COLUMN `rank_label` VARCHAR(60) NULL,
    ADD COLUMN `student_photo_id` INTEGER NULL,
    ADD COLUMN `work_title` VARCHAR(200) NULL;

-- AlterTable
ALTER TABLE `community_services` ADD COLUMN `partner_name` VARCHAR(200) NULL,
    ADD COLUMN `team` JSON NULL;

-- AlterTable
ALTER TABLE `lecturers` ADD COLUMN `bio` TEXT NULL;

-- AlterTable
ALTER TABLE `media` ADD COLUMN `original_name` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `news` ADD COLUMN `cover_caption` VARCHAR(255) NULL,
    ADD COLUMN `event_date` DATETIME(3) NULL,
    ADD COLUMN `event_location` VARCHAR(200) NULL,
    ADD COLUMN `event_organizer` VARCHAR(200) NULL,
    ADD COLUMN `view_count` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `organizations` ADD COLUMN `status` ENUM('draft', 'published') NOT NULL DEFAULT 'published',
    ADD COLUMN `url` VARCHAR(500) NULL;

-- AlterTable
ALTER TABLE `partnerships` ADD COLUMN `show_on_home` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sort_order` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `research` ADD COLUMN `authors_text` VARCHAR(400) NULL,
    ADD COLUMN `body` LONGTEXT NULL,
    ADD COLUMN `cover_id` INTEGER NULL,
    ADD COLUMN `field` VARCHAR(120) NULL,
    ADD COLUMN `is_featured` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `location_name` VARCHAR(200) NULL,
    ADD COLUMN `progress` ENUM('berlangsung', 'selesai') NOT NULL DEFAULT 'selesai',
    ADD COLUMN `view_count` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `sessions` (
    `id` VARCHAR(64) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `ip` VARCHAR(64) NULL,
    `user_agent` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `sessions_user_id_idx`(`user_id`),
    INDEX `sessions_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `login_attempts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(190) NOT NULL,
    `ip` VARCHAR(64) NOT NULL,
    `success` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `login_attempts_email_created_at_idx`(`email`, `created_at`),
    INDEX `login_attempts_ip_created_at_idx`(`ip`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `achievement_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `achievement_id` INTEGER NOT NULL,
    `media_id` INTEGER NOT NULL,
    `caption` VARCHAR(255) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `achievement_images_achievement_id_idx`(`achievement_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `research_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `research_id` INTEGER NOT NULL,
    `media_id` INTEGER NOT NULL,
    `caption` VARCHAR(255) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `research_images_research_id_idx`(`research_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `research_files` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `research_id` INTEGER NOT NULL,
    `media_id` INTEGER NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `research_files_research_id_idx`(`research_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `achievements` ADD CONSTRAINT `achievements_student_photo_id_fkey` FOREIGN KEY (`student_photo_id`) REFERENCES `media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `achievement_images` ADD CONSTRAINT `achievement_images_achievement_id_fkey` FOREIGN KEY (`achievement_id`) REFERENCES `achievements`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `achievement_images` ADD CONSTRAINT `achievement_images_media_id_fkey` FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `research` ADD CONSTRAINT `research_cover_id_fkey` FOREIGN KEY (`cover_id`) REFERENCES `media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `research_images` ADD CONSTRAINT `research_images_research_id_fkey` FOREIGN KEY (`research_id`) REFERENCES `research`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `research_images` ADD CONSTRAINT `research_images_media_id_fkey` FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `research_files` ADD CONSTRAINT `research_files_research_id_fkey` FOREIGN KEY (`research_id`) REFERENCES `research`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `research_files` ADD CONSTRAINT `research_files_media_id_fkey` FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
