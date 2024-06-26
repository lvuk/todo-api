import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import Tag from "App/Models/Tag";
import Task from "App/Models/Task";

export default class TasksController {
  public async index({ request, response }: HttpContextContract) {
    const filter = request.input("tag");
    const page = request.input("page", 1);
    const limit = 1;
    var tasks: Array<Task> = [];

    if (!filter) {
      tasks = await Task.query().preload("tags"); //.paginate(page, limit);
    } else {
      const tag = await Tag.query().where("name", filter).first();
      console.log(tag);
      tasks = await tag!.related("tasks").query();
    }

    if (tasks.length === 0) {
      return response.status(404).json({ error: "Tasks not found" });
    }

    return response.status(200).json({ tasks });
  }

  public async store({ request, response }: HttpContextContract) {
    //const { title, description } = request.only(["title", "description"]);
    const taskSchema = schema.create({
      title: schema.string({ trim: true }, [
        rules.maxLength(255),
        rules.minLength(1),
      ]),
      description: schema.string({ trim: true }, [
        rules.maxLength(1024),
        rules.minLength(1),
      ]),
    });

    const data = await request.validate({ schema: taskSchema });
    const task = await Task.create(data);

    return response.status(200).json(task);
  }

  public async show({ request, response }: HttpContextContract) {
    const task = await Task.query()
      .where("id", request.param("id"))
      .preload("tags")
      .first();

    if (!task) {
      return response.status(404).json({ error: "Task not found" });
    }

    return response.status(200).json({ task });
  }

  public async update({ request, response }: HttpContextContract) {
    const task = await Task.query().where("id", request.param("id")).first();

    if (!task) {
      return response.status(404).json({ error: "Task not found" });
    }

    const taskSchema = schema.create({
      title: schema.string.optional({ trim: true }, [
        rules.maxLength(255),
        rules.minLength(1),
      ]),
      description: schema.string.optional({ trim: true }, [
        rules.maxLength(1024),
        rules.minLength(1),
      ]),
    });

    const payload = await request.validate({ schema: taskSchema });

    if (payload.title) {
      task.title = payload.title;
    }

    if (payload.description) {
      task.description = payload.description;
    }

    await task.save();
    return response.status(200).json(task);
  }

  public async destroy({ request, response }: HttpContextContract) {
    const task = await Task.query()
      .where("id", request.param("id"))
      .preload("tags")
      .first();

    if (!task) {
      return response.status(404).json({ error: "Taks does not exists" });
    }

    await task.delete();
    return response.json({ message: "Task successfully deleted" });
  }

  public async addTag({ request, response }: HttpContextContract) {
    const task = await Task.query().where("id", request.param("id")).first();
    const { tagId } = request.only(["tagId"]);
    const reqTag = await Tag.query().where("id", tagId).first();
    var hasTag = false;

    if (!task)
      return response.status(404).json({ error: "Task does not exist" });
    if (!reqTag)
      return response.status(404).json({ error: "This tag does not exist" });
    const tags = await task!.related("tags").query();
    //console.log(tags);
    tags.forEach((tag) => {
      if (tag.id === reqTag.id) hasTag = true;
    });

    if (hasTag)
      return response.status(400).json({ error: "Tag already added to task" });

    await task.related("tags").attach([tagId]);
    return response
      .status(200)
      .json({ message: `${reqTag.name} added to ${task.title}` });
  }

  public async removeTag({ request, response }: HttpContextContract) {
    const task = await Task.query().where("id", request.param("id")).first();
    const { tagId } = request.only(["tagId"]);
    const reqTag = await Tag.query().where("id", tagId).first();
    var hasTag = false;

    //console.log(await tag!.related("tasks").query());

    if (!task)
      return response.status(404).json({ error: "Task does not exist" });
    if (!reqTag)
      return response.status(404).json({ error: "This tag does not exist" });
    const tags = await task!.related("tags").query();
    console.log(tags);
    tags.forEach((tag) => {
      if (tag.id === reqTag.id) hasTag = true;
    });

    if (!hasTag)
      return response
        .status(400)
        .json({ error: "Tag already removed from task" });

    await task.related("tags").detach([tagId]);
    return response
      .status(200)
      .json({ message: `${reqTag.name} removed from ${task.title}` });
  }
}
