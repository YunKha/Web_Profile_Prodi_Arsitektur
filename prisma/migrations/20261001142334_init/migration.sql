-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(190) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'editor') NOT NULL DEFAULT 'editor',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `last_login_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `media` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `path` VARCHAR(500) NOT NULL,
    `mime` VARCHAR(100) NOT NULL,
    `size_bytes` INTEGER NOT NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `alt_text` VARCHAR(255) NULL,
    `uploaded_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `media_path_key`(`path`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `site_settings` (
    `key` VARCHAR(100) NOT NULL,
    `value` JSON NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `page_blocks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `page_key` VARCHAR(80) NOT NULL,
    `block_key` VARCHAR(80) NOT NULL,
    `title` VARCHAR(255) NULL,
    `body` TEXT NULL,
    `image_id` INTEGER NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `page_blocks_page_key_block_key_key`(`page_key`, `block_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mission_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(150) NOT NULL,
    `body` TEXT NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `action` VARCHAR(50) NOT NULL,
    `entity` VARCHAR(80) NOT NULL,
    `entity_id` VARCHAR(40) NULL,
    `diff` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_entity_entity_id_idx`(`entity`, `entity_id`),
    INDEX `audit_logs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accreditations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `agency` VARCHAR(200) NOT NULL,
    `sk_number` VARCHAR(120) NOT NULL,
    `rank` VARCHAR(40) NOT NULL,
    `valid_from` DATE NOT NULL,
    `valid_to` DATE NOT NULL,
    `is_current` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `accreditations_is_current_idx`(`is_current`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accreditation_documents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accreditation_id` INTEGER NOT NULL,
    `type` ENUM('sertifikat', 'lkps', 'led') NOT NULL,
    `media_id` INTEGER NOT NULL,

    UNIQUE INDEX `accreditation_documents_accreditation_id_type_key`(`accreditation_id`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lecturers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(160) NOT NULL,
    `full_name` VARCHAR(200) NOT NULL,
    `front_title` VARCHAR(60) NULL,
    `back_title` VARCHAR(80) NULL,
    `staff_type` ENUM('dosen', 'tendik') NOT NULL DEFAULT 'dosen',
    `structural_role` VARCHAR(120) NULL,
    `academic_rank` VARCHAR(80) NULL,
    `civil_rank` VARCHAR(80) NULL,
    `study_program` VARCHAR(120) NULL,
    `start_year` SMALLINT NULL,
    `expertise` VARCHAR(255) NULL,
    `photo_id` INTEGER NULL,
    `email` VARCHAR(190) NULL,
    `nidn` VARCHAR(30) NULL,
    `nuptk` VARCHAR(30) NULL,
    `sinta_id` VARCHAR(40) NULL,
    `scopus_id` VARCHAR(40) NULL,
    `orcid_id` VARCHAR(40) NULL,
    `sinta_url` VARCHAR(500) NULL,
    `scholar_url` VARCHAR(500) NULL,
    `website_url` VARCHAR(500) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `lecturers_slug_key`(`slug`),
    INDEX `lecturers_status_sort_order_idx`(`status`, `sort_order`),
    FULLTEXT INDEX `lecturers_full_name_expertise_idx`(`full_name`, `expertise`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lecturer_education` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lecturer_id` INTEGER NOT NULL,
    `degree` ENUM('S1', 'S2', 'S3') NOT NULL,
    `major` VARCHAR(150) NOT NULL,
    `institution` VARCHAR(200) NOT NULL,
    `grad_year` SMALLINT NOT NULL,

    INDEX `lecturer_education_lecturer_id_idx`(`lecturer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `facilities` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(120) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `summary` VARCHAR(500) NULL,
    `body` TEXT NULL,
    `capacity` INTEGER NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `facilities_slug_key`(`slug`),
    INDEX `facilities_status_sort_order_idx`(`status`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `facility_features` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `facility_id` INTEGER NOT NULL,
    `icon` VARCHAR(60) NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` VARCHAR(500) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `facility_features_facility_id_idx`(`facility_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `facility_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `facility_id` INTEGER NOT NULL,
    `media_id` INTEGER NOT NULL,
    `caption` VARCHAR(255) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `facility_images_facility_id_idx`(`facility_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `courses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `semester` TINYINT NOT NULL,
    `description` TEXT NULL,
    `credits` TINYINT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `courses_code_key`(`code`),
    INDEX `courses_semester_code_idx`(`semester`, `code`),
    FULLTEXT INDEX `courses_code_name_idx`(`code`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_documents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `course_id` INTEGER NOT NULL,
    `type` ENUM('rps', 'kurikulum') NOT NULL,
    `media_id` INTEGER NOT NULL,
    `academic_year` VARCHAR(9) NULL,

    INDEX `course_documents_course_id_type_idx`(`course_id`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(80) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `media_id` INTEGER NOT NULL,

    UNIQUE INDEX `documents_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `programs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kind` ENUM('akademik', 'nonakademik') NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `summary` VARCHAR(500) NULL,
    `body` TEXT NULL,
    `image_id` INTEGER NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `programs_slug_key`(`slug`),
    INDEX `programs_kind_status_sort_order_idx`(`kind`, `status`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `organizations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(200) NOT NULL,
    `abbreviation` VARCHAR(30) NULL,
    `description` TEXT NULL,
    `logo_id` INTEGER NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `achievements` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(200) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `student_name` VARCHAR(200) NOT NULL,
    `nim` VARCHAR(30) NULL,
    `cohort_year` SMALLINT NULL,
    `achievement_year` SMALLINT NOT NULL,
    `level` ENUM('lokal', 'nasional', 'internasional') NOT NULL DEFAULT 'nasional',
    `category` VARCHAR(100) NULL,
    `summary` VARCHAR(500) NULL,
    `body` TEXT NULL,
    `competition_info` TEXT NULL,
    `concept` TEXT NULL,
    `cover_id` INTEGER NULL,
    `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
    `published_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `achievements_slug_key`(`slug`),
    INDEX `achievements_status_published_at_idx`(`status`, `published_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `achievement_advisors` (
    `achievement_id` INTEGER NOT NULL,
    `lecturer_id` INTEGER NOT NULL,

    PRIMARY KEY (`achievement_id`, `lecturer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alumni` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(200) NOT NULL,
    `grad_year` SMALLINT NULL,
    `job_title` VARCHAR(150) NULL,
    `company` VARCHAR(200) NULL,
    `testimonial` TEXT NULL,
    `photo_id` INTEGER NULL,
    `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `alumni_status_grad_year_idx`(`status`, `grad_year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `research` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(220) NOT NULL,
    `title` VARCHAR(400) NOT NULL,
    `abstract` TEXT NULL,
    `year` SMALLINT NULL,
    `scheme` VARCHAR(150) NULL,
    `external_url` VARCHAR(500) NULL,
    `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `research_slug_key`(`slug`),
    INDEX `research_status_year_idx`(`status`, `year`),
    FULLTEXT INDEX `research_title_idx`(`title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `research_authors` (
    `research_id` INTEGER NOT NULL,
    `lecturer_id` INTEGER NOT NULL,
    `author_order` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`research_id`, `lecturer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `community_services` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(220) NOT NULL,
    `kind` ENUM('dosen', 'mahasiswa') NOT NULL,
    `title` VARCHAR(300) NOT NULL,
    `summary` VARCHAR(500) NULL,
    `body` TEXT NULL,
    `location_name` VARCHAR(200) NULL,
    `lat` DECIMAL(9, 6) NULL,
    `lng` DECIMAL(9, 6) NULL,
    `year` SMALLINT NULL,
    `cover_id` INTEGER NULL,
    `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
    `published_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `community_services_slug_key`(`slug`),
    INDEX `community_services_kind_status_published_at_idx`(`kind`, `status`, `published_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `community_service_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `service_id` INTEGER NOT NULL,
    `media_id` INTEGER NOT NULL,
    `caption` VARCHAR(255) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `community_service_images_service_id_idx`(`service_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `partnerships` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `partner_name` VARCHAR(250) NOT NULL,
    `partner_type` VARCHAR(80) NULL,
    `scope` TEXT NULL,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `logo_id` INTEGER NULL,
    `url` VARCHAR(500) NULL,
    `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `partnerships_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `news` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(220) NOT NULL,
    `title` VARCHAR(300) NOT NULL,
    `excerpt` VARCHAR(600) NULL,
    `body` LONGTEXT NOT NULL,
    `cover_id` INTEGER NULL,
    `category_id` INTEGER NULL,
    `author_id` INTEGER NULL,
    `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
    `published_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `news_slug_key`(`slug`),
    INDEX `news_status_published_at_idx`(`status`, `published_at`),
    INDEX `news_category_id_idx`(`category_id`),
    FULLTEXT INDEX `news_title_excerpt_idx`(`title`, `excerpt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `news_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,

    UNIQUE INDEX `news_categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(80) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `tags_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `news_tags` (
    `news_id` INTEGER NOT NULL,
    `tag_id` INTEGER NOT NULL,

    PRIMARY KEY (`news_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `media` ADD CONSTRAINT `media_uploaded_by_fkey` FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `page_blocks` ADD CONSTRAINT `page_blocks_image_id_fkey` FOREIGN KEY (`image_id`) REFERENCES `media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accreditation_documents` ADD CONSTRAINT `accreditation_documents_accreditation_id_fkey` FOREIGN KEY (`accreditation_id`) REFERENCES `accreditations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accreditation_documents` ADD CONSTRAINT `accreditation_documents_media_id_fkey` FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lecturers` ADD CONSTRAINT `lecturers_photo_id_fkey` FOREIGN KEY (`photo_id`) REFERENCES `media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lecturer_education` ADD CONSTRAINT `lecturer_education_lecturer_id_fkey` FOREIGN KEY (`lecturer_id`) REFERENCES `lecturers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `facility_features` ADD CONSTRAINT `facility_features_facility_id_fkey` FOREIGN KEY (`facility_id`) REFERENCES `facilities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `facility_images` ADD CONSTRAINT `facility_images_facility_id_fkey` FOREIGN KEY (`facility_id`) REFERENCES `facilities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `facility_images` ADD CONSTRAINT `facility_images_media_id_fkey` FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_documents` ADD CONSTRAINT `course_documents_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_documents` ADD CONSTRAINT `course_documents_media_id_fkey` FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_media_id_fkey` FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `programs` ADD CONSTRAINT `programs_image_id_fkey` FOREIGN KEY (`image_id`) REFERENCES `media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `organizations` ADD CONSTRAINT `organizations_logo_id_fkey` FOREIGN KEY (`logo_id`) REFERENCES `media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `achievements` ADD CONSTRAINT `achievements_cover_id_fkey` FOREIGN KEY (`cover_id`) REFERENCES `media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `achievement_advisors` ADD CONSTRAINT `achievement_advisors_achievement_id_fkey` FOREIGN KEY (`achievement_id`) REFERENCES `achievements`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `achievement_advisors` ADD CONSTRAINT `achievement_advisors_lecturer_id_fkey` FOREIGN KEY (`lecturer_id`) REFERENCES `lecturers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alumni` ADD CONSTRAINT `alumni_photo_id_fkey` FOREIGN KEY (`photo_id`) REFERENCES `media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `research_authors` ADD CONSTRAINT `research_authors_research_id_fkey` FOREIGN KEY (`research_id`) REFERENCES `research`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `research_authors` ADD CONSTRAINT `research_authors_lecturer_id_fkey` FOREIGN KEY (`lecturer_id`) REFERENCES `lecturers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `community_services` ADD CONSTRAINT `community_services_cover_id_fkey` FOREIGN KEY (`cover_id`) REFERENCES `media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `community_service_images` ADD CONSTRAINT `community_service_images_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `community_services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `community_service_images` ADD CONSTRAINT `community_service_images_media_id_fkey` FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partnerships` ADD CONSTRAINT `partnerships_logo_id_fkey` FOREIGN KEY (`logo_id`) REFERENCES `media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `news` ADD CONSTRAINT `news_cover_id_fkey` FOREIGN KEY (`cover_id`) REFERENCES `media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `news` ADD CONSTRAINT `news_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `news_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `news` ADD CONSTRAINT `news_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `news_tags` ADD CONSTRAINT `news_tags_news_id_fkey` FOREIGN KEY (`news_id`) REFERENCES `news`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `news_tags` ADD CONSTRAINT `news_tags_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
