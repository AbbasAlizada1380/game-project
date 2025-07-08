import { useState, useEffect } from "react";
import axios from "axios";
import { Trash, Edit, Plus } from "lucide-react";

export default function BlockManager() {
  const [blocks, setBlocks] = useState([]);
  const [newBlock, setNewBlock] = useState({ name: "", services: null });
  const [editingBlock, setEditingBlock] = useState(null);

  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = () => {
    axios
      .get("http://localhost:8000/rights/blocks/")
      .then((res) => setBlocks(res.data))
      .catch((err) => console.error("Error fetching blocks:", err));
  };

  const saveBlock = () => {
    const blockData = {
      name: newBlock.name,
      services: newBlock.services ? parseInt(newBlock.services) : null,
    };

    if (editingBlock) {
      axios
        .put(
          `http://localhost:8000/rights/blocks/${editingBlock.id}/`,
          blockData
        )
        .then((res) => {
          setBlocks(
            blocks.map((b) => (b.id === editingBlock.id ? res.data : b))
          );
          resetForm();
        })
        .catch((err) => console.error("Error updating block:", err));
    } else {
      axios
        .post("http://localhost:8000/rights/blocks/", blockData)
        .then((res) => {
          setBlocks([...blocks, res.data]);
          resetForm();
        })
        .catch((err) => console.error("Error adding block:", err));
    }
  };

  const deleteBlock = (id) => {
    axios
      .delete(`http://localhost:8000/rights/blocks/${id}/`)
      .then(() => setBlocks(blocks.filter((b) => b.id !== id)))
      .catch((err) => console.error("Error deleting block:", err));
  };

  const editBlock = (block) => {
    setNewBlock({ name: block.name, services: block.services });
    setEditingBlock(block);
  };

  const resetForm = () => {
    setNewBlock({ name: "", services: null });
    setEditingBlock(null);
  };

  return (
    <div className="p-4 max-w-lg mx-auto bg-white shadow rounded-lg">
      <h2 className="text-2xl mb-4 text-center font-semibold">Manage Blocks</h2>

      {/* Input Fields */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <input
          type="text"
          placeholder="Block Name"
          value={newBlock.name}
          onChange={(e) => setNewBlock({ ...newBlock, name: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Service ID"
          value={newBlock.services || ""}
          onChange={(e) =>
            setNewBlock({
              ...newBlock,
              services: e.target.value ? parseInt(e.target.value) : null,
            })
          }
          className="border p-2 rounded"
        />
        <button
          onClick={saveBlock}
          className="col-span-2 bg-blue-500 text-white p-2 rounded flex items-center justify-center"
        >
          <Plus className="w-4 h-4 mr-1" />
          {editingBlock ? "Update Block" : "Add Block"}
        </button>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">Name</th>
            <th className="border border-gray-300 p-2">Service ID</th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((block) => (
            <tr key={block.id} className="text-center">
              <td className="border border-gray-300 p-2">{block.name}</td>
              <td className="border border-gray-300 p-2">{block.services}</td>
              <td className="border border-gray-300 p-2 flex justify-center gap-2">
                <button
                  onClick={() => editBlock(block)}
                  className="text-blue-500"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteBlock(block.id)}
                  className="text-red-500"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
