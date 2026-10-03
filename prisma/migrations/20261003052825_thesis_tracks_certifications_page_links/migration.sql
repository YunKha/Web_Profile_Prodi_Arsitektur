-- AlterTable
ALTER TABLE `lecturer_education` MODIFY `degree` ENUM('S1', 'S2', 'S3', 'Profesi') NOT NULL;

-- AlterTable
ALTER TABLE `lecturers` ADD COLUMN `expertise_group` ENUM('perancangan', 'teori_sejarah', 'sains_bangunan') NULL,
    ADD COLUMN `serdos_institution` VARCHAR(200) NULL,
    ADD COLUMN `serdos_number` VARCHAR(60) NULL,
    ADD COLUMN `wos_id` VARCHAR(40) NULL;

-- AlterTable
ALTER TABLE `page_blocks` ADD COLUMN `link_label` VARCHAR(100) NULL,
    ADD COLUMN `link_url` VARCHAR(500) NULL;

-- CreateTable
CREATE TABLE `page_block_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `page_key` VARCHAR(80) NOT NULL,
    `block_key` VARCHAR(80) NOT NULL,
    `media_id` INTEGER NOT NULL,
    `caption` VARCHAR(255) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `page_block_images_page_key_block_key_idx`(`page_key`, `block_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `thesis_tracks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(80) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `description` TEXT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('draft', 'published') NOT NULL DEFAULT 'published',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `thesis_tracks_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `thesis_steps` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `track_id` INTEGER NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `body` TEXT NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `thesis_steps_track_id_idx`(`track_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lecturer_certifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lecturer_id` INTEGER NOT NULL,
    `number` VARCHAR(80) NOT NULL,
    `institution` VARCHAR(200) NOT NULL,
    `title` VARCHAR(120) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `lecturer_certifications_lecturer_id_idx`(`lecturer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `page_block_images` ADD CONSTRAINT `page_block_images_media_id_fkey` FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `thesis_steps` ADD CONSTRAINT `thesis_steps_track_id_fkey` FOREIGN KEY (`track_id`) REFERENCES `thesis_tracks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lecturer_certifications` ADD CONSTRAINT `lecturer_certifications_lecturer_id_fkey` FOREIGN KEY (`lecturer_id`) REFERENCES `lecturers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
