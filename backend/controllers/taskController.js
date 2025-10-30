import prisma from "../db.js"; 

// Belirli bir projedeki tüm görevleri getir
export const getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Görevleri çek ve ilişkili kullanıcı bilgilerini al
    const tasks = await prisma.tasks.findMany({
      where: { project_id: parseInt(projectId) },
      orderBy: { created_at: "desc" },
      include: {
        users_tasks_created_byTousers: { select: { name: true, surname: true } },
        users_tasks_updated_byTousers: { select: { name: true, surname: true } },
        users_tasks_assignee_idTousers: { select: { name: true, surname: true, profile_picture: true } },
      },
    });

        // Kullanıcı isimlerini kolay okunur şekilde ekle
    const formattedTasks = tasks.map((t) => ({
      ...t,
      created_by_name: t.users_tasks_created_byTousers
        ? `${t.users_tasks_created_byTousers.name} ${t.users_tasks_created_byTousers.surname || ""}`
        : null,
      updated_by_name: t.users_tasks_updated_byTousers
        ? `${t.users_tasks_updated_byTousers.name} ${t.users_tasks_updated_byTousers.surname || ""}`
        : null,
      assigned_to_name: t.users_tasks_assignee_idTousers
        ? `${t.users_tasks_assignee_idTousers.name} ${t.users_tasks_assignee_idTousers.surname || ""}`
        : null,
      assigned_to_avatar: t.users_tasks_assignee_idTousers
        ? t.users_tasks_assignee_idTousers.profile_picture
        : null,
    }));

    res.json(formattedTasks);
  } catch (err) {
    console.error("Görevler alınamadı:", err);
    res.status(500).json({ error: err.message });
  }
};

// Yeni görev oluştur
export const createTask = async (req, res) => {
  try {
    const { project_id, title, description, status, assignee_id, created_by } = req.body;

    // Basit doğrulamalar
    if (!project_id || isNaN(project_id)) 
      return res.status(400).json({ message: "Projeyi belirleyemedik. Lütfen tekrar deneyin." });
      
    if (!title || title.length < 3) 
      return res.status(400).json({ message: "Görev başlığı en az 3 karakter olmalıdır." });
    
    const validStatus = ["Todo", "In Progress", "Backlog", "Done"];
    if (!status || !validStatus.includes(status)) 
      return res.status(400).json({ message: "Görev durumu geçersiz. Lütfen bir durum seçin." });
    
    if (!created_by || isNaN(created_by)) 
      return res.status(400).json({ message: "Bu görevi kimin oluşturduğunu belirleyemedik. Lütfen tekrar giriş yapın." });
    
    if (assignee_id && isNaN(assignee_id)) 
      return res.status(400).json({ message: "Görevi atayacağımız kullanıcı bilgisi geçersiz." });

    // Görevi oluştur
    const task = await prisma.tasks.create({
      data: {
        project_id,
        title,
        description,
        status,
        assignee_id,
        created_by,
      },
      include: {
        users_tasks_assignee_idTousers: { select: { name: true, surname: true, profile_picture: true } },
      },
    });

    // Görevi frontend için hazırla
    const result = {
      ...task,
      assigned_to_name: task.users_tasks_assignee_idTousers
        ? `${task.users_tasks_assignee_idTousers.name} ${task.users_tasks_assignee_idTousers.surname || ""}`
        : null,
      assigned_to_avatar: task.users_tasks_assignee_idTousers
        ? task.users_tasks_assignee_idTousers.profile_picture
        : null,
    };

    res.json(result);
  } catch (err) {
    console.error("Task oluşturma hatası:", err);
    res.status(500).json({ message: "Görev oluşturulamadı. Lütfen tekrar deneyin." });
  }
};

// Mevcut görevi güncelle
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, assignee_id, updated_by } = req.body;
    
    // Basit doğrulamalar
    if (!title || title.length < 3) 
      return res.status(400).json({ message: "Görev başlığı en az 3 karakter olmalıdır." });

    const validStatus = ["Todo", "In Progress", "Backlog", "Done"];
    if (!status || !validStatus.includes(status)) 
      return res.status(400).json({ message: "Görev durumu geçersiz. Lütfen bir durum seçin." });

    if (updated_by && isNaN(updated_by)) 
      return res.status(400).json({ message: "Görevi güncelleyecek kullanıcı bilgisi geçersiz." });

    if (assignee_id && isNaN(assignee_id)) 
      return res.status(400).json({ message: "Görevi atayacağımız kullanıcı bilgisi geçersiz." });

    // Güncelle ve ilişkili kullanıcı bilgilerini al
    const updatedTask = await prisma.tasks.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        status,
        assignee_id,
        updated_by,
        updated_at: new Date(),
      },
      include: {
        users_tasks_assignee_idTousers: {
          select: { name: true, surname: true, profile_picture: true },
        },
      },
    });

    // Frontend için düzenle
    const result = {
      ...updatedTask,
      assigned_to_name: updatedTask.users_tasks_assignee_idTousers
        ? `${updatedTask.users_tasks_assignee_idTousers.name} ${updatedTask.users_tasks_assignee_idTousers.surname || ""}`
        : null,
      assigned_to_avatar: updatedTask.users_tasks_assignee_idTousers
        ? updatedTask.users_tasks_assignee_idTousers.profile_picture
        : null,
    };

    res.json(result);
  } catch (err) {
    console.error("Task güncelleme hatası:", err);
    res.status(500).json({ message: "Görev güncellenemedi. Lütfen tekrar deneyin." });
  }
};

// Görevi sil
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTask = await prisma.tasks.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Task deleted successfully", deleted: deletedTask });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

