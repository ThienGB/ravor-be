const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env từ đúng đường dẫn của backend
dotenv.config({ path: path.join(__dirname, '../.env') });

const taskSchema = new mongoose.Schema({
  day: mongoose.Schema.Types.Mixed
}, { strict: false });

const Task = mongoose.model('Task', taskSchema);

const migrate = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('Lỗi: Không tìm thấy MONGODB_URI trong file .env');
      process.exit(1);
    }

    console.log('Đang kết nối tới MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Kết nối thành công!');

    // Lấy tất cả task có 'day' là String
    const tasks = await Task.find({ day: { $type: "string" } });
    console.log(`Tìm thấy ${tasks.length} tasks cần chuyển đổi dữ liệu.`);

    let count = 0;
    for (let task of tasks) {
      if (typeof task.day === 'string') {
        // Trích xuất số từ chuỗi, ví dụ: "Day 5" -> 5
        const dayMatch = task.day.match(/\d+/);
        const dayNumber = dayMatch ? parseInt(dayMatch[0]) : 1;
        
        task.day = dayNumber;
        await task.save();
        count++;
        console.log(`- Đã chuyển Task ${task._id}: "${task.day}" (String) -> ${dayNumber} (Number)`);
      }
    }

    console.log(`--- HOÀN TẤT: Đã chuyển đổi thành công ${count}/${tasks.length} tasks. ---`);
    process.exit(0);
  } catch (err) {
    console.error('Lỗi khi thực hiện migrate:', err);
    process.exit(1);
  }
};

migrate();
