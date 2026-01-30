-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 18, 2026 at 03:37 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `schoolportal_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `accounts`
--

CREATE TABLE `accounts` (
  `account_id` int(11) NOT NULL,
  `studentUser_id` int(11) NOT NULL,
  `student_id` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `plain_password` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `accounts`
--

INSERT INTO `accounts` (`account_id`, `studentUser_id`, `student_id`, `password_hash`, `plain_password`) VALUES
(1, 1, 'A22-0001', '$2b$10$ektR1nv73Y47ubL6/gi5ve6V2EvlNCLoNXs0NP3yH3PKE2drigVgq', 'newpassword123'),
(2, 2, 'A22-0002', '$2b$10$Oo4rZCSqdJG7rxC3OVhbnO6B4LoiFX6VP5zTLnt81UIdDFPYnCb2G', 'password'),
(3, 3, 'A22-0003', '$2b$10$2gBOKOkEO7Rg12I6iO//Y./3kLbChnR29utxUycyZ2820Acq51zPq', 'password'),
(4, 4, 'A22-0004', '$2b$10$xyr2G.T3swRyxqFSeJ3AxuPtFRbheA74/6zsbDWoR6dQnowV1aKB.', 'password123'),
(5, 5, 'A22-0005', '$2b$10$mpil2avp5sb.BJ8T6ADgKO3BjqtddlD1wa4YpaFlUUw/Jfio6M2tm', 'helloworld');

-- --------------------------------------------------------

--
-- Table structure for table `admin_accounts`
--

CREATE TABLE `admin_accounts` (
  `admin_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `plain_password` varchar(250) NOT NULL DEFAULT '',
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `postion` varchar(30) NOT NULL,
  `adminuser_id` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_accounts`
--

INSERT INTO `admin_accounts` (`admin_id`, `username`, `password_hash`, `plain_password`, `full_name`, `email`, `phone`, `created_at`, `postion`, `adminuser_id`) VALUES
(1, 'admin', '$2b$10$5elxnYdGY6cAvaYKF9YA7Ol8OftVHLD3whzjYRJ/A48cmSCRfeKEC', 'password', 'System Administrator', 'admin@mseuf.edu.ph', '09123456789', '2025-10-14 12:04:28', 'Admin', 'A22-0001'),
(2, 'registrar', '$2b$10$cKg/xDMrQlf6SVbHpSHZWe6eNSyyTiyWsKd/jYc32ORuSQlYu24zm', 'registrar123', 'Registrar Admin', 'registrar@mseuf.edu.ph', '09987654321', '2025-10-14 12:04:28', 'Admin', 'A22-0002');

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `category` varchar(50) NOT NULL,
  `date_published` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `content`, `category`, `date_published`) VALUES
(1, 'asds', 'asd ahsdkjha akhsdkajh ;akshd ;khas;dh ;akjshd ;kahsd', 'Academic', '2025-10-29'),
(2, 'new', 'new', 'General', '2025-11-03'),
(3, 'test', 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Laudantium quidem quibusdam ad! Atque recusandae aut distinctio magnam, blanditiis quibusdam sapiente eos ut voluptatum praesentium animi sit maiores commodi! Error, sit!', 'General', '2025-11-11'),
(4, 'test2', 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Laudantium quidem quibusdam ad! Atque recusandae aut distinctio magnam, blanditiis quibusdam sapiente eos ut voluptatum praesentium animi sit maiores commodi! Error, sit!Lorem ipsum dolor, sit amet consectetur adipisicing elit. Laudantium quidem quibusdam ad! Atque recusandae aut distinctio magnam, blanditiis quibusdam sapiente eos ut voluptatum praesentium animi sit maiores commodi! Error, sit!', 'General', '2025-11-11');

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `course_id` int(11) NOT NULL,
  `course_name` varchar(100) NOT NULL,
  `department_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`course_id`, `course_name`, `department_id`) VALUES
(1, 'BS Computer Science', 1),
(2, 'BS Business Management', 2);

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `department_id` int(11) NOT NULL,
  `department_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`department_id`, `department_name`) VALUES
(1, 'Computer Science'),
(2, 'Business Administration');

-- --------------------------------------------------------

--
-- Table structure for table `grades`
--

CREATE TABLE `grades` (
  `grade_id` int(11) NOT NULL,
  `studentUser_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `midterm_grade` decimal(5,2) DEFAULT NULL,
  `final_grade` decimal(5,2) DEFAULT NULL,
  `academic_year` varchar(9) NOT NULL,
  `semester` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `grades`
--

INSERT INTO `grades` (`grade_id`, `studentUser_id`, `subject_id`, `teacher_id`, `midterm_grade`, `final_grade`, `academic_year`, `semester`) VALUES
(1, 1, 1, 1, 85.00, 1.75, '2024-2025', '1st'),
(2, 2, 2, 2, 88.50, 2.50, '2024-2025', '1st'),
(3, 3, 1, 1, NULL, NULL, '2024-2025', '1st'),
(4, 1, 3, 1, 98.00, 1.00, '2024-2025', '1st'),
(5, 2, 3, 1, 87.00, 1.50, '2024-2025', '1st'),
(6, 2, 1, 1, 90.00, 6.00, '2024-2025', '1st'),
(7, 4, 1, 1, 12.00, 1.00, '2024-2025', '1st'),
(8, 5, 1, 1, 90.00, 1.00, '2024-2025', '1st'),
(9, 4, 2, 2, 90.00, 1.25, '2024-2025', '1st'),
(10, 5, 2, 2, 90.00, 1.00, '2024-2025', '1st');

-- --------------------------------------------------------

--
-- Table structure for table `handle_subject`
--

CREATE TABLE `handle_subject` (
  `handle_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `sectionCode` varchar(10) NOT NULL,
  `schoolyear` varchar(10) NOT NULL,
  `semester` varchar(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `handle_subject`
--

INSERT INTO `handle_subject` (`handle_id`, `teacher_id`, `subject_id`, `department_id`, `sectionCode`, `schoolyear`, `semester`) VALUES
(1, 1, 1, 1, 'LA0001', '2025-2026', '2nd'),
(2, 2, 2, 1, 'LA0002', '2025-2026', '2nd'),
(3, 1, 3, 1, 'LA0003', '2025-2026', '2nd'),
(4, 1, 4, 1, 'LA0004', '2025-2026', '2nd');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `studentUser_id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `middle_name` varchar(2) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `birthdate` date DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `course_id` int(11) NOT NULL,
  `year_level_id` int(11) NOT NULL,
  `encodeGrade` varchar(10) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`studentUser_id`, `first_name`, `middle_name`, `last_name`, `birthdate`, `gender`, `email`, `phone`, `course_id`, `year_level_id`, `encodeGrade`) VALUES
(1, 'John', 'A', 'Doe', '2004-05-12', 'Male', 'shadowclaw2203@gmail.com', '09123456789', 1, 1, 'off'),
(2, 'Jane', 'A', 'Smith', '2003-08-25', 'Female', 'jane@example.com', '09987654321', 2, 2, 'on'),
(3, 'Michael', 'B', 'Johnson', '2005-02-15', 'Male', 'michael.johnson@example.com', '09112224444', 1, 1, 'off'),
(4, 'Juan', 'A', 'Dela Cruz', '2004-06-11', 'Male', 'john@example.com', '09123456789', 1, 1, 'on'),
(5, 'Juana', 'A', 'Dela Cruz', '2004-06-11', 'Female', 'juana@gmail.com', '09123456789', 1, 1, 'off');

-- --------------------------------------------------------

--
-- Table structure for table `student_subject`
--

CREATE TABLE `student_subject` (
  `stud_sub_id` int(11) NOT NULL,
  `studentUser_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `department_id``` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `sectionCode` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_subject`
--

INSERT INTO `student_subject` (`stud_sub_id`, `studentUser_id`, `subject_id`, `department_id```, `teacher_id`, `sectionCode`) VALUES
(1, 1, 1, 1, 1, 'LA0001'),
(3, 1, 3, 1, 1, 'LA0002'),
(4, 2, 3, 1, 1, 'LA0003'),
(5, 2, 1, 1, 1, 'LA0001'),
(6, 2, 2, 1, 2, 'LA0002'),
(7, 4, 1, 1, 1, 'LA0001'),
(8, 4, 2, 1, 2, 'LA0002'),
(9, 5, 1, 1, 1, 'LA0001'),
(10, 5, 2, 1, 2, 'LA0002');

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `subject_id` int(11) NOT NULL,
  `subject_code` varchar(20) NOT NULL,
  `subject_name` varchar(100) NOT NULL,
  `course_id` int(11) NOT NULL,
  `unit` int(2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`subject_id`, `subject_code`, `subject_name`, `course_id`, `unit`) VALUES
(1, 'CS101', 'Introduction to Programming', 1, 5),
(2, 'BM201', 'Principles of Marketing', 2, 5),
(3, 'ADSADS', 'History', 1, 5),
(4, 'dfsdfsd', 'English', 1, 5);

-- --------------------------------------------------------

--
-- Table structure for table `teachers`
--

CREATE TABLE `teachers` (
  `teacher_id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `middle_name` varchar(2) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(50) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `department_id` int(11) NOT NULL,
  `teacherUser_id` varchar(11) NOT NULL,
  `encode` enum('on','off') NOT NULL,
  `final_encode` enum('on','off') NOT NULL,
  `archive` enum('on','off') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teachers`
--

INSERT INTO `teachers` (`teacher_id`, `first_name`, `middle_name`, `last_name`, `email`, `phone`, `department_id`, `teacherUser_id`, `encode`, `final_encode`, `archive`) VALUES
(1, 'Mark', 'A', 'Anderson', 'shadowclaw2203@gmail.com', '09112223333', 1, 'T22-0001', 'on', 'on', 'off'),
(2, 'Emily', 'A', 'Brown', 'emily.brown@example.com', '09223334444', 2, 'T22-0002', 'on', 'on', 'off');

-- --------------------------------------------------------

--
-- Table structure for table `teacher_accounts`
--

CREATE TABLE `teacher_accounts` (
  `account_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `name_teacher` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `plain_password` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teacher_accounts`
--

INSERT INTO `teacher_accounts` (`account_id`, `teacher_id`, `name_teacher`, `password_hash`, `plain_password`) VALUES
(1, 1, 'mark_anderson', '$2b$10$iJetrhyCG7TIbd/3lW0gQO5aiN7C5hUoWyk4ULRfVBV1EwPnIhM7O', 'password123'),
(2, 2, 'emily_brown', '$2b$10$g65XXvDBgriStaslX1dccuPOylEbv9Vw0LjfytXeWbAX4SEwdnpAq', 'password');

-- --------------------------------------------------------

--
-- Table structure for table `teacher_subjects`
--

CREATE TABLE `teacher_subjects` (
  `teacher_subject_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teacher_subjects`
--

INSERT INTO `teacher_subjects` (`teacher_subject_id`, `teacher_id`, `subject_id`) VALUES
(1, 1, 1),
(2, 2, 2);

-- --------------------------------------------------------

--
-- Table structure for table `year_levels`
--

CREATE TABLE `year_levels` (
  `year_level_id` int(11) NOT NULL,
  `year_level_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `year_levels`
--

INSERT INTO `year_levels` (`year_level_id`, `year_level_name`) VALUES
(1, '1st Year'),
(2, '2nd Year');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accounts`
--
ALTER TABLE `accounts`
  ADD PRIMARY KEY (`account_id`),
  ADD UNIQUE KEY `student_id` (`student_id`);

--
-- Indexes for table `admin_accounts`
--
ALTER TABLE `admin_accounts`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`course_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`department_id`);

--
-- Indexes for table `grades`
--
ALTER TABLE `grades`
  ADD PRIMARY KEY (`grade_id`);

--
-- Indexes for table `handle_subject`
--
ALTER TABLE `handle_subject`
  ADD PRIMARY KEY (`handle_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`studentUser_id`);

--
-- Indexes for table `student_subject`
--
ALTER TABLE `student_subject`
  ADD PRIMARY KEY (`stud_sub_id`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`subject_id`),
  ADD UNIQUE KEY `subject_code` (`subject_code`);

--
-- Indexes for table `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`teacher_id`);

--
-- Indexes for table `teacher_accounts`
--
ALTER TABLE `teacher_accounts`
  ADD PRIMARY KEY (`account_id`),
  ADD UNIQUE KEY `teacher_id` (`name_teacher`);

--
-- Indexes for table `teacher_subjects`
--
ALTER TABLE `teacher_subjects`
  ADD PRIMARY KEY (`teacher_subject_id`);

--
-- Indexes for table `year_levels`
--
ALTER TABLE `year_levels`
  ADD PRIMARY KEY (`year_level_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accounts`
--
ALTER TABLE `accounts`
  MODIFY `account_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `admin_accounts`
--
ALTER TABLE `admin_accounts`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `course_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `department_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `grades`
--
ALTER TABLE `grades`
  MODIFY `grade_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `studentUser_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `subject_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `teachers`
--
ALTER TABLE `teachers`
  MODIFY `teacher_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `teacher_accounts`
--
ALTER TABLE `teacher_accounts`
  MODIFY `account_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `teacher_subjects`
--
ALTER TABLE `teacher_subjects`
  MODIFY `teacher_subject_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `year_levels`
--
ALTER TABLE `year_levels`
  MODIFY `year_level_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
