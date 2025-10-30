import prisma from "../db.js";

// Tüm projeleri listele
export const getProjects = async (req, res) => {
  try {
    const projects = await prisma.projects.findMany();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Yeni proje oluştur
export const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    //Validation
    if (!title || title.length < 3) {
      return res.status(400).json({ error: "Proje başlığı en az 3 karakter olmalı" });
    }

    const project = await prisma.projects.create({
      data: {
        title,
        description: description || null, // opsiyonel
      },
    });

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
