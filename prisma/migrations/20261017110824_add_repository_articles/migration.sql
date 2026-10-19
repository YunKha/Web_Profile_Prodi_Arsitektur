-- CreateTable
CREATE TABLE `repository_articles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(220) NOT NULL,
    `title` VARCHAR(400) NOT NULL,
    `authors` VARCHAR(300) NULL,
    `year` SMALLINT NULL,
    `category` VARCHAR(100) NULL,
    `abstract` TEXT NULL,
    `body` LONGTEXT NULL,
    `drive_links` JSON NULL,
    `cover_id` INTEGER NULL,
    `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
    `view_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `repository_articles_slug_key`(`slug`),
    INDEX `repository_articles_status_year_idx`(`status`, `year`),
    INDEX `repository_articles_status_category_idx`(`status`, `category`),
    FULLTEXT INDEX `repository_articles_title_idx`(`title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `repository_articles` ADD CONSTRAINT `repository_articles_cover_id_fkey` FOREIGN KEY (`cover_id`) REFERENCES `media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
