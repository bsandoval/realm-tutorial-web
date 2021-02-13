import { ObjectId } from "bson";
import { useMutation } from "@apollo/client";
import gql from "graphql-tag";

export default function useTaskMutations(project) {
  return {
    addTask: useAddTask(project),
    updateTask: useUpdateTask(project),
    deleteTask: useDeleteTask(project),
  };
}

// Add the GraphGL mutation for adding a task.
const AddTaskMutation = gql`
  mutation AddTask($task: TaskInsertInput!) {
    addedTask: insertOneTask(data: $task) {
      _id
      _partition
      name
      status
    }
  }
`;

// Add the GraphGL mutation for updating a task.
const UpdateTaskMutation = gql`
  mutation UpdateTask($taskId: ObjectId!, $updates: TaskUpdateInput!) {
    updatedTask: updateOneTask(query: { _id: $taskId }, set: $updates) {
      _id
      _partition
      name
      status
    }
  }
`;

// Add the GraphGL mutation for deleting a task.
const DeleteTaskMutation = gql`
  mutation DeleteTask($taskId: ObjectId!) {
    deletedTask: deleteOneTask(query: { _id: taskId }) {
      _id
      _partition
      name
      status
    }
  }
`;

const TaskFieldsFragment = gql`
  fragment TaskFields on Task {
    _id
    _partition
    status
    name
  }
`;

function useAddTask(project) {
  const [addTaskMutation] = useMutation(AddTaskMutation, {
    // Manually save added Tasks into the Apollo cache so that Task queries automatically update
    // For details, refer to https://www.apollographql.com/docs/react/data/mutations/#making-all-other-cache-updates
    update: (cache, { data: { addedTask } }) => {
      cache.modify({
        fields: {
          tasks: (existingTasks = []) => [
            ...existingTasks,
            cache.writeFragment({
              data: addedTask,
              fragment: TaskFieldsFragment,
            }),
          ],
        },
      });
    },
  });

  const addTask = async (task) => {
    //Use the functions returned from the addTaskMutation hook to execute the mutation.
    const { addedTask } = await addTaskMutation({
      variables: {
        task: {
          _id: new ObjectId(),
          _partition: project.partition,
          status: "Open",
          ...task,
        },
      },
    });

    return addedTask;
  };

  return addTask;
}

function useUpdateTask(project) {
   //Use the functions returned from the updateTaskMutation to execute the mutation.
  const [updateTaskMutation] = useMutation(UpdateTaskMutation);

  //where task is a mongo model
  const updateTask = async (task, updates) => {
    const { updatedTask } = await updateTaskMutation({
      variables: { taskId: task._id, updates },
    })
    return updatedTask;
  };
  return updateTask;
}

function useDeleteTask(project) {
  const [deleteTaskMutation] = useMutation(DeleteTaskMutation);
   //Use the functions returned from the deleteTaskMutation to execute the mutation.
  const deleteTask = async (task, updates) => {
    const { deletedTask } = await deleteTaskMutation({
      variables: { taskId: task._id },
    })
    return deletedTask;
  }
  return deleteTask;
}
